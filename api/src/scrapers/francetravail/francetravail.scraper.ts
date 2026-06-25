import { BaseScraper, RawJob } from '../base.scraper'
import { UserFiltersConfig } from '../../filters/filters.service'
import 'dotenv/config'

const TOKEN_URL = 'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire'
const API_URL = 'https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search'

interface FranceTravailToken {
  access_token: string
  expires_in: number
}

interface FranceTravailOffre {
  id: string
  intitule: string
  entreprise?: { nom?: string }
  origineOffre?: { urlOrigine?: string }
  description?: string
  lieuTravail?: { libelle?: string }
  typeContrat?: string
  salaire?: { libelle?: string }
  dateCreation?: string
  teleTravailPossible?: boolean
}

export class FranceTravailScraper extends BaseScraper {
  source = 'francetravail'
  private userFilters: UserFiltersConfig | null

  constructor(userFilters: UserFiltersConfig | null = null) {
    super()
    this.userFilters = userFilters
  }

  private async getToken(): Promise<string> {
    const body = `grant_type=client_credentials&client_id=${process.env.FRANCE_TRAVAIL_CLIENT_ID}&client_secret=${process.env.FRANCE_TRAVAIL_CLIENT_SECRET}&scope=api_offresdemploiv2%20o2dsoffre`

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    const data = await response.json() as FranceTravailToken
    return data.access_token
  }

  async fetch(): Promise<RawJob[]> {
    const token = await this.getToken()

    const params = new URLSearchParams({ range: '0-149' })

    // Localisation
    if (this.userFilters?.commune) {
      params.set('commune', this.userFilters.commune)
      if (this.userFilters.radius) {
        params.set('distance', this.userFilters.radius.toString())
      }
    } else if (this.userFilters?.departement) {
      params.set('departement', this.userFilters.departement)
    }

    // Types de contrat
    if (this.userFilters?.contractTypes?.length) {
      params.set('typeContrat', this.userFilters.contractTypes.join(','))
    }

    const response = await fetch(`${API_URL}?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    if (response.status === 204) return []

    const data = await response.json() as { resultats?: FranceTravailOffre[] }
    const offres = data.resultats || []

    return offres.map((offre): RawJob => ({
      externalId: `ft-${offre.id}`,
      title: offre.intitule || '',
      company: offre.entreprise?.nom || 'Non précisé',
      url: offre.origineOffre?.urlOrigine || `https://candidat.francetravail.fr/offres/recherche/detail/${offre.id}`,
      description: offre.description || '',
      location: offre.lieuTravail?.libelle || 'Non précisé',
      remote: offre.teleTravailPossible ? 'frequent' : 'none',
      salary: offre.salaire?.libelle,
      publishedAt: offre.dateCreation ? new Date(offre.dateCreation) : new Date(),
      source: this.source,
    }))
  }
}