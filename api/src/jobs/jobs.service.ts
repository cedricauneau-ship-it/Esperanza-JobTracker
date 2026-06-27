import { prisma } from '../prisma/prisma.service'
import { getUserFilters } from '../filters/filters.service'
import { filterJobs } from '../filters/job.filter'
import { RawJob } from '../scrapers/base.scraper'

export const getJobs = async (userId: string, page: number = 1, source?: string, days?: number) => {
  const limit = 30
  const offset = (page - 1) * limit

  const dateFilter = days
    ? new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    : undefined

  const allJobs = await prisma.jobOffer.findMany({
    where: {
      status: { not: 'ignored' },
      ...(source && source !== 'all' ? { source } : {}),
      ...(dateFilter ? { publishedAt: { gte: dateFilter } } : {}),
    },
    orderBy: { publishedAt: 'desc' },
  })

  const filters = await getUserFilters(userId)
  const filtered = filterJobs(allJobs as unknown as RawJob[], filters)

  const total = filtered.length
  const jobs = filtered.slice(offset, offset + limit)

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