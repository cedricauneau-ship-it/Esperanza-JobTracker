import { prisma } from '../prisma/prisma.service'
import { getUserFilters } from '../filters/filters.service'
import { FranceTravailScraper } from './francetravail/francetravail.scraper'

export async function runScrapers(userId: string) {
  const userFilters = await getUserFilters(userId)

  const scrapers = [
    new FranceTravailScraper(userFilters),
    // new WTTJScraper(userFilters),
    // new BetaGouvScraper(userFilters),
  ]

  for (const scraper of scrapers) {
    try {
      console.log(`[${scraper.source}] Scraping en cours...`)
      const rawJobs = await scraper.fetch()
      console.log(`[${scraper.source}] ${rawJobs.length} offres récupérées`)

      for (const job of rawJobs) {
        await prisma.jobOffer.upsert({
          where: { externalId: job.externalId },
          update: {},
          create: { ...job },
        })
      }

      console.log(`[${scraper.source}] Offres sauvegardées en base`)
    } catch (error) {
      console.error(`[${scraper.source}] Erreur:`, error)
    }
  }
}