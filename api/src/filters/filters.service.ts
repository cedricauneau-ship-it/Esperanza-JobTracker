import { prisma } from '../prisma/prisma.service'
import { JobFilters } from './job.filter'

export interface UserFiltersConfig extends JobFilters {
  departement?: string
  commune?: string
  radius?: number
}

export const getUserFilters = async (userId: string): Promise<UserFiltersConfig | null> => {
  const filters = await prisma.userFilters.findUnique({ where: { userId } })
  if (!filters) return null

  return {
    excludedStacks: filters.excludedStacks,
    excludedKeywords: filters.excludedKeywords,
    excludedCompanies: filters.excludedCompanies,
    requiredStacks: filters.requiredStacks,
    contractTypes: filters.contractTypes,
    remoteOnly: filters.remoteOnly,
    departement: filters.departement ?? undefined,
    commune: filters.commune ?? undefined,
    radius: filters.radius ?? undefined,
  }
}

export const upsertUserFilters = async (userId: string, filters: Partial<UserFiltersConfig>) => {
  return prisma.userFilters.upsert({
    where: { userId },
    update: { ...filters },
    create: {
      userId,
      excludedStacks: filters.excludedStacks || [],
      excludedKeywords: filters.excludedKeywords || [],
      excludedCompanies: filters.excludedCompanies || [],
      requiredStacks: filters.requiredStacks || [],
      contractTypes: filters.contractTypes || [],
      remoteOnly: filters.remoteOnly || false,
      departement: filters.departement,
      commune: filters.commune,
      radius: filters.radius,
    },
  })
}

export const deleteUserFilters = async (userId: string) => {
  return prisma.userFilters.delete({ where: { userId } })
}