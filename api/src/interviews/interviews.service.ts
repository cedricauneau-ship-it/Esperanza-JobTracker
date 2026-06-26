import { prisma } from '../prisma/prisma.service'

// Crée un entretien lié à une candidature
export const createInterview = async (
  applicationId: string,
  scheduledAt: Date,
  type: string,
  notes?: string
) => {
  // Met à jour le statut de l'offre en "interview"
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  })

  if (!application) throw new Error('Candidature introuvable')

  await prisma.jobOffer.update({
    where: { id: application.jobOfferId },
    data: { status: 'interview' },
  })

  return prisma.interview.create({
    data: {
      applicationId,
      scheduledAt,
      type,
      notes,
    },
  })
}

// Récupère tous les entretiens d'une candidature
export const getInterviews = async (applicationId: string) => {
  return prisma.interview.findMany({
    where: { applicationId },
    orderBy: { scheduledAt: 'asc' },
  })
}

// Met à jour un entretien
export const updateInterview = async (
  id: string,
  data: { scheduledAt?: Date; type?: string; notes?: string }
) => {
  return prisma.interview.update({
    where: { id },
    data,
  })
}

// Supprime un entretien
export const deleteInterview = async (id: string) => {
  return prisma.interview.delete({ where: { id } })
}