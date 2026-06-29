import { chromium } from 'playwright'
import { BaseScraper, RawJob } from '../base.scraper'
import { prisma } from '../../prisma/prisma.service'

const BASE_URL = 'https://fr.indeed.com'

const CITIES = [
  'Paris', 'Toulouse', 'Bordeaux', 'Jarnac',
  'Montpellier', 'Toulon', 'La Rochelle'
]

const MAX_CONSECUTIVE_FAILURES = 3
const PAUSE_DURATION_HOURS = 24

export class IndeedScraper extends BaseScraper {
  source = 'indeed'

  private async getNextCity(): Promise<string | null> {
    const now = new Date()

    const config = await prisma.scraperConfig.upsert({
      where: { source: 'indeed' },
      update: { currentPage: { increment: 1 } },
      create: { source: 'indeed', currentPage: 0 },
    })

    // Vérifie si le scraper est en pause
    if (config.pausedUntil && config.pausedUntil > now) {
      const remaining = Math.ceil((config.pausedUntil.getTime() - now.getTime()) / 1000 / 60)
      console.log(`[Indeed] En pause pendant encore ${remaining} minutes`)
      return null
    }

    const cityIndex = config.currentPage % CITIES.length
    return CITIES[cityIndex]
  }

  private async recordSuccess(): Promise<void> {
    // Remet les échecs à 0 et retire la pause si elle existait
    await prisma.scraperConfig.update({
      where: { source: 'indeed' },
      data: {
        consecutiveFailures: 0,
        pausedUntil: null,
        lastScrapedAt: new Date(),
      },
    })
  }

  private async recordFailure(): Promise<void> {
    const config = await prisma.scraperConfig.findUnique({
      where: { source: 'indeed' },
    })

    const failures = (config?.consecutiveFailures || 0) + 1
    console.log(`[Indeed] Échec ${failures}/${MAX_CONSECUTIVE_FAILURES}`)

    const pausedUntil = failures >= MAX_CONSECUTIVE_FAILURES
      ? new Date(Date.now() + PAUSE_DURATION_HOURS * 60 * 60 * 1000)
      : null

    if (pausedUntil) {
      console.log(`[Indeed] ${MAX_CONSECUTIVE_FAILURES} échecs consécutifs — pause de ${PAUSE_DURATION_HOURS}h`)
    }

    await prisma.scraperConfig.update({
      where: { source: 'indeed' },
      data: { consecutiveFailures: failures, pausedUntil },
    })
  }

  async fetch(): Promise<RawJob[]> {
    const city = await this.getNextCity()

    // Si en pause, on retourne un tableau vide sans lancer Chrome
    if (!city) return []

    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'fr-FR',
    })
    const browserPage = await context.newPage()

    try {
      const url = `${BASE_URL}/emplois?l=${encodeURIComponent(city)}&radius=50`
      console.log(`[Indeed] Ville: ${city} — URL: ${url}`)

      await browserPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await browserPage.waitForTimeout(3000)

      const hasJobs = await browserPage.$('.job_seen_beacon')
      if (!hasJobs) {
        console.log(`[Indeed] Aucune offre trouvée pour ${city}`)
        await browser.close()
        await this.recordFailure()
        return []
      }

      await browserPage.waitForSelector('.job_seen_beacon', { timeout: 15000 })

      const jobs = await browserPage.$$eval('.job_seen_beacon', (cards) => {
        return cards.map(card => {
          const titleEl = card.querySelector('h3.jobTitle a')
          const title = titleEl?.textContent?.trim() || ''
          const jk = titleEl?.getAttribute('data-jk') || ''
          const href = titleEl?.getAttribute('href') || ''
          const company = card.querySelector('[data-testid="company-name"]')?.textContent?.trim() || ''
          const location = card.querySelector('[data-testid="text-location"]')?.textContent?.trim() || ''
          return { title, jk, href, company, location }
        })
      })

      await browser.close()

      const result: RawJob[] = jobs
        .filter(job => job.title && job.jk)
        .map(job => ({
          externalId: `indeed-${job.jk}`,
          title: job.title,
          company: job.company,
          url: job.href.startsWith('http') ? job.href : `${BASE_URL}${job.href}`,
          description: '',
          location: job.location,
          remote: 'none',
          publishedAt: new Date(),
          source: this.source,
        }))

      // Succès — remet les compteurs à 0
      await this.recordSuccess()
      console.log(`[Indeed] ${city}: ${result.length} offres extraites`)
      return result

    } catch (error) {
      await browser.close()
      await this.recordFailure()
      throw error
    }
  }
}