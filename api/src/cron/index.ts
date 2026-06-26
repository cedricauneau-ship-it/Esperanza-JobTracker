import { startScraperCron } from './scraper.cron'
import { startFollowUpCron } from './followup.cron'
import { startCleanupCron } from './cleanup.cron'

// Démarre tous les jobs planifiés de l'application
export function startAllCrons() {
  startScraperCron()   // scraping des offres à 8h et 18h
  startFollowUpCron()  // rappels de relance à 9h
  startCleanupCron()   // nettoyage des offres expirées à 2h
}