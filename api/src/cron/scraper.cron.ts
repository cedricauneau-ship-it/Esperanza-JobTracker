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
  // Scraping à 8h
  cron.schedule('0 8 * * *', () => {
    console.log('[Cron] 8h — scraping du matin')
    runDailyScraping()
  })

  // Scraping à 18h
  cron.schedule('0 18 * * *', () => {
    console.log('[Cron] 18h — scraping du soir')
    runDailyScraping()
  })

  console.log('[Cron] Scraper cron démarré (8h et 18h)')
}