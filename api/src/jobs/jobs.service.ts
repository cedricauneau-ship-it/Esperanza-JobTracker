import { prisma } from '../prisma/prisma.service'
import { getUserFilters } from '../filters/filters.service'

export const getJobs = async (userId: string, page: number = 1, source?: string, days?: number) => {
  const limit = 30
  const offset = (page - 1) * limit

  const dateFilter = days
    ? new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    : undefined

  const userFilters = await getUserFilters(userId)

  // Construit les conditions Prisma depuis les filtres utilisateur
  // au lieu de filtrer en mémoire après avoir tout chargé
  const where: any = {
    status: { not: 'ignored' },
    ...(source && source !== 'all' ? { source } : {}),
    ...(dateFilter ? { publishedAt: { gte: dateFilter } } : {}),
    // Stacks/mots-clés requis
    ...(userFilters?.requiredStacks?.length ? {
      OR: userFilters.requiredStacks.map(stack => ({
        OR: [
          { title: { contains: stack, mode: 'insensitive' } },
          { description: { contains: stack, mode: 'insensitive' } },
        ]
      }))
    } : {}),
    // Stacks exclues
    ...(userFilters?.excludedStacks?.length ? {
      AND: userFilters.excludedStacks.map(stack => ({
        AND: [
          { title: { not: { contains: stack, mode: 'insensitive' } } },
          { description: { not: { contains: stack, mode: 'insensitive' } } },
        ]
      }))
    } : {}),
    // Mots-clés exclus
    ...(userFilters?.excludedKeywords?.length ? {
      AND: [
        ...(userFilters?.excludedStacks?.length ? userFilters.excludedStacks.map(stack => ({
          AND: [
            { title: { not: { contains: stack, mode: 'insensitive' } } },
            { description: { not: { contains: stack, mode: 'insensitive' } } },
          ]
        })) : []),
        ...userFilters.excludedKeywords.map(keyword => ({
          AND: [
            { title: { not: { contains: keyword, mode: 'insensitive' } } },
            { description: { not: { contains: keyword, mode: 'insensitive' } } },
          ]
        }))
      ]
    } : {}),
    // Entreprises exclues
    ...(userFilters?.excludedCompanies?.length ? {
      company: {
        notIn: userFilters.excludedCompanies,
        mode: 'insensitive'
      }
    } : {}),
    // Télétravail uniquement
    ...(userFilters?.remoteOnly ? { remote: { not: 'none' } } : {}),
  }

  // Compte le total AVANT de paginer — une seule requête légère
  const total = await prisma.jobOffer.count({ where })

  // Récupère uniquement la page demandée — pas tout en mémoire
  const jobs = await prisma.jobOffer.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    skip: offset,
    take: limit,
    // Ne sélectionne pas la description pour alléger l'egress
    select: {
      id: true,
      externalId: true,
      title: true,
      company: true,
      url: true,
      location: true,
      remote: true,
      salary: true,
      source: true,
      publishedAt: true,
      scrapedAt: true,
      status: true,
    }
  })

  return {
    jobs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export const getJobById = async (id: string) => {
  return prisma.jobOffer.findUnique({ where: { id } })
}

export const updateJobStatus = async (id: string, status: string) => {
  return prisma.jobOffer.update({
    where: { id },
    data: { status },
  })
}

export const deleteJob = async (id: string) => {
  return prisma.jobOffer.delete({ where: { id } })
}