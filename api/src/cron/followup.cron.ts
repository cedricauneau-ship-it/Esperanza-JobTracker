import cron from 'node-cron'
import { prisma } from '../prisma/prisma.service'

async function sendFollowUpReminders() {
  console.log('[Cron] Vérification des relances...')

  const now = new Date()

  // Récupère toutes les candidatures dont le followUpAt est dépassé et pas encore envoyé
  const applications = await prisma.application.findMany({
    where: {
      followUpSent: false,
      followUpAt: { lte: now },
    },
    include: {
      user: true,
      jobOffer: true,
    },
  })

  for (const application of applications) {
    try {
      console.log(
        `[Cron] Rappel relance — user ${application.userId} — ${application.jobOffer.company} (${application.jobOffer.title})`
      )

      // Pour l'instant on log — plus tard on enverra un email ou une notification push
      // TODO: envoyer email ou notification push

      await prisma.application.update({
        where: { id: application.id },
        data: { followUpSent: true },
      })
    } catch (error) {
      console.error(`[Cron] Erreur relance application ${application.id}:`, error)
    }
  }

  console.log(`[Cron] ${applications.length} rappels traités`)
}

export function startFollowUpCron() {
  // Vérifie les relances tous les jours à 9h
  cron.schedule('0 9 * * *', () => {
    console.log('[Cron] 9h — vérification des relances')
    sendFollowUpReminders()
  })

  console.log('[Cron] FollowUp cron démarré (tous les jours à 9h)')
}