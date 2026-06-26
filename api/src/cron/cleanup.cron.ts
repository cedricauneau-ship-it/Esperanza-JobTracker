import cron from 'node-cron'
import { prisma } from '../prisma/prisma.service'

async function cleanupExpiredJobs() {
  console.log('[Cron] Nettoyage des offres expirées...')

  const now = new Date()

  // Récupère tous les utilisateurs qui ont des filtres configurés
  const usersWithFilters = await prisma.userFilters.findMany({
    select: {
      userId: true,
      expiredAfterDays: true,
    },
  })

  // Pour les utilisateurs sans filtres, on utilise 14 jours par défaut
  const defaultExpiredAfterDays = 14

  // Récupère tous les utilisateurs
  const allUsers = await prisma.user.findMany({ select: { id: true } })

  for (const user of allUsers) {
    // Trouve les préférences de l'utilisateur ou utilise les valeurs par défaut
    const userFilter = usersWithFilters.find(f => f.userId === user.id)
    const expiredAfterDays = userFilter?.expiredAfterDays || defaultExpiredAfterDays

    // Calcule la date limite — offres non vues depuis X jours
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() - expiredAfterDays)

    // Marque les offres comme expirées si elles n'ont pas été vues depuis X jours
    const marked = await prisma.jobOffer.updateMany({
      where: {
        lastSeenAt: { lt: expiryDate },
        status: 'to_review', // on ne touche pas aux offres avec candidature
      },
      data: { status: 'expired' },
    })

    if (marked.count > 0) {
      console.log(`[Cron] ${marked.count} offres marquées comme expirées pour user ${user.id}`)
    }

    // Supprime les offres expirées depuis plus de 60 jours sans candidature
    const deletionDate = new Date()
    deletionDate.setDate(deletionDate.getDate() - 60)

    const deleted = await prisma.jobOffer.deleteMany({
      where: {
        status: 'expired',
        lastSeenAt: { lt: deletionDate },
        application: null, // pas de candidature associée
      },
    })

    if (deleted.count > 0) {
      console.log(`[Cron] ${deleted.count} offres supprimées définitivement`)
    }
  }

  console.log('[Cron] Nettoyage terminé')
}

export function startCleanupCron() {
  // Nettoyage tous les jours à 2h du matin
  cron.schedule('0 2 * * *', () => {
    console.log('[Cron] 2h — nettoyage des offres expirées')
    cleanupExpiredJobs()
  })

  console.log('[Cron] Cleanup cron démarré (tous les jours à 2h)')
}