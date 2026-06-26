import { BaseScraper, RawJob } from '../base.scraper'
import { chromium } from 'playwright'

const BASE_URL = 'https://fr.indeed.com'

export class IndeedScraper extends BaseScraper {
  source = 'indeed'

  private buildUrl(page: number = 1): string {
    const params = new URLSearchParams({
      q: 'développeur',
      l: 'Paris',
      start: ((page - 1) * 15).toString(), // Indeed pagine par 15
    })
    return `${BASE_URL}/emplois?${params.toString()}`
  }

    async fetch(): Promise<RawJob[]> {
        const browser = await chromium.launch({ headless: true })
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale: 'fr-FR',
        })
        const browserPage = await context.newPage()
        const allJobs: RawJob[] = []

        try {
            const url = this.buildUrl(1)
            console.log(`[Indeed] URL: ${url}`)

            await browserPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
            await browserPage.waitForTimeout(3000)
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

            allJobs.push(...pageJobs)
            console.log(`[Indeed] ${pageJobs.length} offres extraites`)

        } finally {
            await browser.close()
        }

        return allJobs
    }
}