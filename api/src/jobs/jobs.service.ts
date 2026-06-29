import { prisma } from '../prisma/prisma.service'
import { getUserFilters } from '../filters/filters.service'

export const getJobs = async (userId: string, page: number = 1, source?: string, days?: number) => {
  const limit = 30
  const offset = (page - 1) * limit

  const dateFilter = days
    ? new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    : undefined

  const userFilters = await getUserFilters(userId)

  const where: any = {
    status: { not: 'ignored' },
    ...(source && source !== 'all' ? { source } : {}),
    ...(dateFilter ? { publishedAt: { gte: dateFilter } } : {}),
  }

  // Stacks requises — au moins une doit être présente
  if (userFilters?.requiredStacks?.length) {
    where.OR = userFilters.requiredStacks.flatMap(stack => [
      { title: { contains: stack, mode: 'insensitive' } },
      { description: { contains: stack, mode: 'insensitive' } },
    ])
  }

  // Stacks exclues
  if (userFilters?.excludedStacks?.length) {
    where.NOT = [
      ...userFilters.excludedStacks.flatMap(stack => [
        { title: { contains: stack, mode: 'insensitive' } },
        { description: { contains: stack, mode: 'insensitive' } },
      ])
    ]
  }

  // Mots-clés exclus — ajoutés au NOT existant
  if (userFilters?.excludedKeywords?.length) {
    where.NOT = [
      ...(where.NOT || []),
      ...userFilters.excludedKeywords.flatMap(keyword => [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ])
    ]
  }

  // Entreprises exclues
  if (userFilters?.excludedCompanies?.length) {
    where.NOT = [
      ...(where.NOT || []),
      ...userFilters.excludedCompanies.map(company => ({
        company: { contains: company, mode: 'insensitive' }
      }))
    ]
  }

  // Télétravail uniquement
  if (userFilters?.remoteOnly) {
    where.remote = { not: 'none' }
  }

  const total = await prisma.jobOffer.count({ where })

  const jobs = await prisma.jobOffer.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    skip: offset,
    take: limit,
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