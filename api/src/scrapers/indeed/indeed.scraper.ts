import { chromium } from 'playwright'
import { BaseScraper, RawJob } from '../base.scraper'
import { prisma } from '../../prisma/prisma.service'

const BASE_URL = 'https://fr.indeed.com'

export class IndeedScraper extends BaseScraper {
  source = 'indeed'

  // Récupère la page courante depuis la base et l'incrémente
  private async getAndIncrementPage(): Promise<number> {
    const config = await prisma.scraperConfig.upsert({
      where: { source: 'indeed' },
      // Si la config existe, on incrémente la page
      update: {
        currentPage: { increment: 1 },
        lastScrapedAt: new Date(),
      },
      // Si la config n'existe pas, on la crée à la page 1
      create: {
        source: 'indeed',
        currentPage: 1,
        lastScrapedAt: new Date(),
      },
    })
    return config.currentPage
  }

  // Remet la pagination à 1 si la page est vide (captcha ou fin des résultats)
  private async resetPage(): Promise<void> {
    await prisma.scraperConfig.update({
      where: { source: 'indeed' },
      data: { currentPage: 1 },
    })
    console.log('[Indeed] Pagination remise à 1')
  }

  private buildUrl(page: number): string {
  const params = new URLSearchParams({
    l: 'France',
    start: ((page - 1) * 15).toString(),
  })
  return `${BASE_URL}/emplois?${params.toString()}`
}

  async fetch(): Promise<RawJob[]> {
    // Récupère et incrémente la page courante
    const currentPage = await this.getAndIncrementPage()
    console.log(`[Indeed] Scraping page ${currentPage}`)

    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'fr-FR',
    })
    const browserPage = await context.newPage()

    try {
      const url = this.buildUrl(currentPage)
      console.log(`[Indeed] URL: ${url}`)

      await browserPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await browserPage.waitForTimeout(3000)

      // Vérifie si des offres sont présentes
      const hasJobs = await browserPage.$('.job_seen_beacon')
      if (!hasJobs) {
        // Pas d'offres — captcha ou fin des résultats, on remet à 1
        await this.resetPage()
        await browser.close()
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

      const pageJobs: RawJob[] = jobs
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

      console.log(`[Indeed] Page ${currentPage}: ${pageJobs.length} offres extraites`)
      return pageJobs

    } catch (error) {
      await browser.close()
      // En cas d'erreur on remet la pagination à 1
      await this.resetPage()
      throw error
    }
  }
}