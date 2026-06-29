import cron from 'node-cron'
import { prisma } from '../prisma/prisma.service'
import { runScrapers } from '../scrapers'

async function runDailyScraping() {
  console.log('[Cron] Lancement du scraping...')

  const users = await prisma.user.findMany({ select: { id: true } })

  for (const user of users) {
    try {
      console.log(`[Cron] Scraping pour user ${user.id}`)
      await runScrapers(user.id)
    } catch (error) {
      console.error(`[Cron] Erreur scraping user ${user.id}:`, error)
    }
  }

  console.log('[Cron] Scraping terminé')
}

export function startScraperCron() {
  cron.schedule('0 8,18 * * *', () => {
    console.log('[Cron] Scraping automatique')
    runDailyScraping()
  })

  console.log('[Cron] Scraper cron démarré (8h et 18h)')
}