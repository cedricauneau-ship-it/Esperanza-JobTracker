export interface RawJob {
  externalId: string
  title: string
  company: string
  url: string
  description: string
  location: string
  remote: string
  salary?: string
  publishedAt: Date
  source: string
}

export abstract class BaseScraper {
  abstract source: string
  abstract fetch(): Promise<RawJob[]>
}