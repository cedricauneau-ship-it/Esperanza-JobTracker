'use client'

import { useEffect, useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { useAuth } from '../context/auth.context'
import Link from 'next/link'

interface JobOffer {
  title: string
  company: string
  location: string
  url: string
}

interface Interview {
  id: string
  type: string
  scheduledAt: string
  notes?: string
}

interface Application {
  id: string
  jobOfferId: string
  appliedAt: string
  followUpAt: string
  followUpSent: boolean
  notes?: string
  jobOffer: JobOffer
  interviews: Interview[]
}

const interviewTypeLabel: Record<string, string> = {
  phone: 'Appel téléphonique',
  technical: 'Entretien technique',
  fit: 'Entretien fit',
  final: 'Entretien final',
}

export default function ApplicationsPage() {
  const { signout } = useAuth()
  const { fetchWithAuth } = useFetch()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const data = await fetchWithAuth('/applications')
        setApplications(data.applications)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (applicationId: string, jobOfferId: string) => {
    if (!confirm('Supprimer cette candidature ?')) return
    try {
      await fetchWithAuth(`/applications/${applicationId}`, {
        method: 'DELETE',
        body: JSON.stringify({ jobOfferId }),
      })
      setApplications(prev => prev.filter(app => app.id !== applicationId))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Esperanza</h1>
        <nav className="flex gap-12 text-sm">
          <Link href="/dashboard" className="text-gray-500 hover:text-black">Offres</Link>
          <Link href="/applications" className="font-medium">Candidatures</Link>
          <Link href="/settings" className="text-gray-500 hover:text-black">Filtres</Link>
        </nav>
        <button
            onClick={signout}
            className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Déconnexion
          </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 flex-1 w-full flex flex-col">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-20 text-gray-400">Chargement...</div>
        ) : applications.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-gray-500">
            Aucune candidature — postule à des offres depuis le dashboard
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {applications.map(app => (
              <div key={app.id} className="bg-white rounded-xl border p-5">

                {/* Offre */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <a
                      href={app.jobOffer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:underline"
                    >
                      {app.jobOffer.title}
                    </a>
                    <p className="text-gray-600 text-sm mt-1">{app.jobOffer.company} — {app.jobOffer.location}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-right text-xs text-gray-400 shrink-0">
                      <p>Postulée le {new Date(app.appliedAt).toLocaleDateString('fr-FR')}</p>
                      <p className={app.followUpSent ? 'text-green-500' : 'text-orange-400'}>
                        Relance {app.followUpSent ? 'envoyée' : `le ${new Date(app.followUpAt).toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(app.id, app.jobOfferId)}
                      className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-2 py-1 rounded-lg transition-colors shrink-0"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                {/* Notes */}
                {app.notes && (
                  <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                    {app.notes}
                  </p>
                )}

                {/* Entretiens */}
                {app.interviews.length > 0 && (
                  <div className="border-t pt-3 mt-3">
                    <p className="text-xs text-gray-400 mb-2">Entretiens</p>
                    <div className="flex flex-col gap-2">
                      {app.interviews.map(interview => (
                        <div key={interview.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{interviewTypeLabel[interview.type]}</span>
                          <span className="text-gray-400 text-xs">
                            {new Date(interview.scheduledAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <footer className="border-t mt-8 py-4 px-6 flex flex-col items-center gap-1 text-sm">
        <span>© {new Date().getFullYear()} Esperanza — Créé par{' '} 
          <a
            href='https://www.cedric-auneau.dev'
            target='_blank'
            className="underline hover:text-blue-500 transition-colors"
            aria-label='Portfolio'
          >
            Cédric Auneau
          </a>
        </span>
        <a
          href="/mentions-legales"
          target='_blank'
          className="underline hover:text-blue-500 transition-colors"
          aria-label="Mentions légales"
        >
          Mentions légales
        </a>
      </footer>
    </div>
  )
}