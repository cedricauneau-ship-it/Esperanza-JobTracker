import { BaseScraper, RawJob } from '../base.scraper'
import { UserFiltersConfig } from '../../filters/filters.service'
import 'dotenv/config'

const API_URL = 'https://api.apprentissage.beta.gouv.fr/api/job/v1/search'

export class LaBonneAlternanceScraper extends BaseScraper {
  source = 'labonnealternance'
  private userFilters: UserFiltersConfig | null

  constructor(userFilters: UserFiltersConfig | null = null) {
    super()
    this.userFilters = userFilters
  }

  async fetch(): Promise<RawJob[]> {
    const params = new URLSearchParams()

    // Localisation depuis les préférences utilisateur
    if (this.userFilters?.commune) {
      // Si l'utilisateur a configuré une commune, on utilise ses coordonnées
      // Pour l'instant on passe le département comme fallback
      params.set('radius', this.userFilters.radius?.toString() || '30')
    } else if (this.userFilters?.departement) {
      params.set('departement', this.userFilters.departement)
    }
    // Sans localisation configurée, l'API retourne toutes les offres de France

    const response = await fetch(`${API_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${process.env.LA_BONNE_ALTERNANCE_API_KEY!}`,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`[LBA] Erreur HTTP: ${response.status}`)
      return []
    }

    const data = await response.json() as { jobs?: any[] }
    const jobs = data.jobs || []

    console.log(`[LBA] ${jobs.length} offres récupérées`)

    return jobs.map((job: any): RawJob => ({
      externalId: `lba-${job.identifier.id}`,
      title: job.offer?.title || '',
      company: job.workplace?.name || job.workplace?.legal_name || 'Non précisé',
      url: job.apply?.url || 'https://labonnealternance.apprentissage.beta.gouv.fr',
      description: job.offer?.description || '',
      location: job.workplace?.location?.address || 'Non précisé',
      remote: job.contract?.remote ? 'frequent' : 'none',
      publishedAt: job.offer?.publication?.creation
        ? new Date(job.offer.publication.creation)
        : new Date(),
      source: this.source,
    }))
  }
}