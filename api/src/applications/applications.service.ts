import { prisma } from '../prisma/prisma.service'
import { getUserFilters } from '../filters/filters.service'

// Crée une candidature liée à une offre
// followUpAt est calculé automatiquement selon les préférences de l'utilisateur
export const createApplication = async (
  userId: string,
  jobOfferId: string,
  notes?: string
) => {
  // Récupère les préférences de l'utilisateur pour le délai de relance
  const filters = await getUserFilters(userId)
  const followUpDays = filters?.followUpDays || 7

  // Calcule la date de relance (aujourd'hui + followUpDays)
  const followUpAt = new Date()
  followUpAt.setDate(followUpAt.getDate() + followUpDays)

  // Met à jour le statut de l'offre en "applied"
  await prisma.jobOffer.update({
    where: { id: jobOfferId },
    data: { status: 'applied' },
  })

  return prisma.application.create({
    data: {
      userId,
      jobOfferId,
      notes,
      followUpAt,
    },
    include: { jobOffer: true },
  })
}

// Récupère toutes les candidatures de l'utilisateur
export const getApplications = async (userId: string) => {
  return prisma.application.findMany({
    where: { userId },
    include: {
      jobOffer: true,
      interviews: true,
    },
    orderBy: { appliedAt: 'desc' },
  })
}

// Récupère une candidature par son id
export const getApplicationById = async (id: string) => {
  return prisma.application.findUnique({
    where: { id },
    include: {
      jobOffer: true,
      interviews: true,
    },
  })
}

// Met à jour les notes d'une candidature
export const updateApplication = async (id: string, notes: string) => {
  return prisma.application.update({
    where: { id },
    data: { notes },
  })
}

// Supprime une candidature et remet l'offre en "to_review"
export const deleteApplication = async (id: string, jobOfferId: string) => {
  await prisma.jobOffer.update({
    where: { id: jobOfferId },
    data: { status: 'to_review' },
  })

  return prisma.application.delete({ where: { id } })
}