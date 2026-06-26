import { prisma } from '../prisma/prisma.service'
import { getUserFilters } from '../filters/filters.service'
import { FranceTravailScraper } from './francetravail/francetravail.scraper'
import { IndeedScraper } from './indeed/indeed.scraper'

async function runScrapers(userId: string) {
  const userFilters = await getUserFilters(userId)

  const scrapers = [
    new FranceTravailScraper(userFilters),
    new IndeedScraper(),
  ]

  for (const scraper of scrapers) {
    try {
      console.log(`[${scraper.source}] Scraping en cours...`)
      const rawJobs = await scraper.fetch()
      console.log(`[${scraper.source}] ${rawJobs.length} offres récupérées`)

      const now = new Date()

      for (const job of rawJobs) {
        await prisma.jobOffer.upsert({
          where: { externalId: job.externalId },
          // Si l'offre existe déjà, on met à jour lastSeenAt pour indiquer qu'elle est toujours active
          update: { lastSeenAt: now },
          // Si l'offre est nouvelle, on la crée avec lastSeenAt = maintenant
          create: { ...job, lastSeenAt: now },
        })
      }

      console.log(`[${scraper.source}] Offres sauvegardées en base`)
    } catch (error) {
      console.error(`[${scraper.source}] Erreur:`, error)
    }
  }
}

export { runScrapers }