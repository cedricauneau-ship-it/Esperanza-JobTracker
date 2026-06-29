import { prisma } from '../prisma/prisma.service'
import { getUserFilters } from '../filters/filters.service'
import { FranceTravailScraper } from './francetravail/francetravail.scraper'
import { IndeedScraper } from './indeed/indeed.scraper'
import { LaBonneAlternanceScraper } from './labonnealternance/labonnealternance.scraper'
import { RawJob } from './base.scraper'

async function runScrapers(userId: string) {
  const userFilters = await getUserFilters(userId)

  const scrapers = [
    new FranceTravailScraper(userFilters),
    new IndeedScraper(),
    new LaBonneAlternanceScraper(userFilters),
  ]

  for (const scraper of scrapers) {
    try {
      console.log(`[${scraper.source}] Scraping en cours...`)
      const rawJobs = await scraper.fetch()
      console.log(`[${scraper.source}] ${rawJobs.length} offres récupérées`)

      const now = new Date()
      let created = 0
      let updated = 0

      // Récupère tous les externalIds déjà en base pour cette source
      // Une seule requête légère au lieu d'un upsert par offre
      const existingIds = await prisma.jobOffer.findMany({
        where: {
          externalId: { in: rawJobs.map(j => j.externalId) }
        },
        select: { externalId: true }
      })

      const existingSet = new Set(existingIds.map(j => j.externalId))

      const newJobs: RawJob[] = []
      const existingJobs: string[] = []

      for (const job of rawJobs) {
        if (existingSet.has(job.externalId)) {
          existingJobs.push(job.externalId)
        } else {
          newJobs.push(job)
        }
      }

      // Crée les nouvelles offres en batch
      if (newJobs.length > 0) {
        await prisma.jobOffer.createMany({
          data: newJobs.map(job => ({ ...job, lastSeenAt: now })),
          skipDuplicates: true,
        })
        created = newJobs.length
      }

      // Met à jour uniquement lastSeenAt des offres existantes en batch
      if (existingJobs.length > 0) {
        await prisma.jobOffer.updateMany({
          where: { externalId: { in: existingJobs } },
          data: { lastSeenAt: now },
        })
        updated = existingJobs.length
      }

      console.log(`[${scraper.source}] ${created} nouvelles offres, ${updated} mises à jour`)
    } catch (error) {
      console.error(`[${scraper.source}] Erreur:`, error)
    }
  }
}

export { runScrapers }