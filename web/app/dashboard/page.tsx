'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../context/auth.context'
import { useFetch } from '../hooks/useFetch'
import Link from 'next/link'

interface Job {
  id: string
  title: string
  company: string
  location: string
  remote: string
  salary?: string
  source: string
  status: string
  publishedAt: string
  url: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const remoteLabel: Record<string, string> = {
  total: '100% remote',
  frequent: 'Télétravail fréquent',
  occasional: 'Télétravail occasionnel',
  none: 'Présentiel',
}

const statusColors: Record<string, string> = {
  to_review: 'bg-gray-100 text-gray-700',
  applied: 'bg-blue-100 text-blue-700',
  interview: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
  offer: 'bg-green-100 text-green-700',
  ignored: 'bg-gray-100 text-gray-400',
}

export default function Dashboard() {
  const { signout } = useAuth()
  const { fetchWithAuth } = useFetch()

  const [jobs, setJobs] = useState<Job[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isScraping, setIsScraping] = useState(false)
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError('')
      try {
        const params = new URLSearchParams({ page: currentPage.toString() })
        if (sourceFilter !== 'all') params.append('source', sourceFilter)
        if (dateFilter !== 'all') params.append('days', dateFilter)
        const data = await fetchWithAuth(`/jobs?${params.toString()}`)
        setJobs(data.jobs || [])
        setPagination(data.pagination || null)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [currentPage, sourceFilter, dateFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleScrape = async () => {
    setIsScraping(true)
    try {
      await fetchWithAuth('/jobs/scrape', { method: 'POST' })
      // Recharge les offres après le scraping
      const params = new URLSearchParams({ page: '1' })
      if (sourceFilter !== 'all') params.append('source', sourceFilter)
      const data = await fetchWithAuth(`/jobs?${params.toString()}`)
      setJobs(data.jobs || [])
      setPagination(data.pagination || null)
      setCurrentPage(1)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsScraping(false)
    }
  }

  const handleStatusChange = async (jobId: string, status: string) => {
    try {
      await fetchWithAuth(`/jobs/${jobId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setJobs(prev => prev.map(job =>
        job.id === jobId ? { ...job, status } : job
      ))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Esperanza</h1>
        <nav className="flex gap-12 text-sm">
          <Link href="/dashboard" className="font-medium">Offres</Link>
          <Link href="/applications" className="text-gray-500 hover:text-black">Candidatures</Link>
          <Link href="/settings" className="text-gray-500 hover:text-black">Filtres</Link>
        </nav>
        <div className="flex gap-3">
          <button
            onClick={signout}
            className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

        {/* Bouton recherche centré */}
        <div className="flex justify-center py-6 bg-white">
          <button
            onClick={handleScrape}
            disabled={isScraping}
            className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isScraping ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Recherche en cours...
              </>
            ) : (
              "Recherche de nouvelles offres"
            )}
          </button>
        </div>

      <main className="max-w-5xl mx-auto px-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Compteur et filtre source sur la même ligne */}
        <div className="flex items-center justify-between mb-4">
          {pagination ? (
            <p className="text-gray-500 text-sm">
              {pagination.total} offres — page {pagination.page} / {pagination.totalPages}
            </p>
          ) : <div />}
          <select
            value={sourceFilter}
            onChange={e => {
              setSourceFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">Toutes les offres</option>
            <option value="francetravail">France Travail</option>
            <option value="indeed">Indeed</option>
          </select>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className='flex justify-center gap-10 mb-6'>
            <div className="flex justify-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Précédent
              </button>
              <span className="px-4 py-2 text-sm text-gray-500">
                {currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
              <select
                value={dateFilter}
                onChange={e => {
                  setDateFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="7">7 derniers jours</option>
                <option value="14">14 derniers jours</option>
                <option value="30">30 derniers jours</option>
                <option value="all">Toutes les dates</option>
              </select>
          </div>  
        )}

        {isLoading ? (
          <div className="text-center py-20 text-gray-400">Chargement...</div>
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                Aucune offre — lance une recherche pour commencer
              </div>
            ) : (
              jobs.map(job => (
                <div key={job.id} className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold hover:underline"
                      >
                        {job.title}
                      </a>
                      <p className="text-gray-600 text-sm mt-1">{job.company}</p>
                      <div className="flex gap-2 flex-wrap mt-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{job.location}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{remoteLabel[job.remote] || job.remote}</span>
                        {job.salary && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{job.salary}</span>
                        )}
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{job.source}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {new Date(job.publishedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <select
                      value={job.status}
                      onChange={e => handleStatusChange(job.id, e.target.value)}
                      className={`text-xs px-3 py-1 rounded-full border-0 font-medium cursor-pointer ${statusColors[job.status]}`}
                    >
                      <option value="to_review">À lire</option>
                      <option value="applied">Postulée</option>
                      <option value="interview">Entretien</option>
                      <option value="rejected">Refus</option>
                      <option value="offer">Offre</option>
                      <option value="ignored">Ignorer</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8 mb-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Précédent
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">
              {currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Suivant
            </button>
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