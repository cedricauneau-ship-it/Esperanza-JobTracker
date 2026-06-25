import { RawJob } from '../scrapers/base.scraper'

export interface JobFilters {
  excludedStacks: string[]
  excludedKeywords: string[]
  excludedCompanies: string[]
  requiredStacks: string[]
  contractTypes: string[]
  remoteOnly: boolean
}

export function filterJobs(jobs: RawJob[], filters: JobFilters | null): RawJob[] {
  if (!filters) return jobs

  return jobs.filter(job => {
    const text = `${job.title} ${job.description} ${job.company}`.toLowerCase()

    if (filters.excludedStacks.some(s => text.includes(s.toLowerCase()))) return false
    if (filters.excludedKeywords.some(k => text.includes(k.toLowerCase()))) return false
    if (filters.excludedCompanies.some(c => job.company.toLowerCase().includes(c.toLowerCase()))) return false
    if (filters.requiredStacks.length > 0 && !filters.requiredStacks.some(s => text.includes(s.toLowerCase()))) return false
    if (filters.remoteOnly && job.remote === 'none') return false

    return true
  })
}