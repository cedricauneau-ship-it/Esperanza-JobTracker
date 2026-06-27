'use client'

import { useEffect, useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { useAuth } from '../context/auth.context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Filters {
  excludedStacks: string[]
  excludedKeywords: string[]
  excludedCompanies: string[]
  requiredStacks: string[]
  contractTypes: string[]
  remoteOnly: boolean
  departement?: string
  commune?: string
  radius?: number
  followUpDays: number
  expiredAfterDays: number
}

export default function SettingsPage() {
  const { fetchWithAuth } = useFetch()
  const { signout } = useAuth()
  const router = useRouter()

  const [filters, setFilters] = useState<Filters>({
    excludedStacks: [],
    excludedKeywords: [],
    excludedCompanies: [],
    requiredStacks: [],
    contractTypes: [],
    remoteOnly: false,
    followUpDays: 7,
    expiredAfterDays: 14,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Champs texte pour les tableaux (on entre les valeurs séparées par des virgules)
  const [excludedStacksInput, setExcludedStacksInput] = useState('')
  const [excludedKeywordsInput, setExcludedKeywordsInput] = useState('')
  const [excludedCompaniesInput, setExcludedCompaniesInput] = useState('')
  const [requiredStacksInput, setRequiredStacksInput] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchWithAuth('/filters')
        if (data.filters) {
          setFilters(data.filters)
          // Convertit les tableaux en chaînes pour les inputs
          setExcludedStacksInput(data.filters.excludedStacks?.join(', ') || '')
          setExcludedKeywordsInput(data.filters.excludedKeywords?.join(', ') || '')
          setExcludedCompaniesInput(data.filters.excludedCompanies?.join(', ') || '')
          setRequiredStacksInput(data.filters.requiredStacks?.join(', ') || '')
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSave = async () => {
        setIsSaving(true)
        setError('')
        setSuccess(false)
        try {
            await fetchWithAuth('/filters', {
            method: 'PUT',
            body: JSON.stringify({
                ...filters,
                excludedStacks: excludedStacksInput.split(',').map(s => s.trim()).filter(Boolean),
                excludedKeywords: excludedKeywordsInput.split(',').map(s => s.trim()).filter(Boolean),
                excludedCompanies: excludedCompaniesInput.split(',').map(s => s.trim()).filter(Boolean),
                requiredStacks: requiredStacksInput.split(',').map(s => s.trim()).filter(Boolean),
            }),
            })
            // Redirige vers le dashboard après sauvegarde
            router.push('/dashboard')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue')
            setIsSaving(false)
        }
    }

  const handleSignout = () => {
    signout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Esperanza</h1>
        <nav className="flex gap-12 text-sm">
          <Link href="/dashboard" className="text-gray-500 hover:text-black">Offres</Link>
          <Link href="/applications" className="text-gray-500 hover:text-black">Candidatures</Link>
          <Link href="/settings" className="font-medium">Filtres</Link>
        </nav>
        <button
          onClick={handleSignout}
          className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          Déconnexion
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold mb-6">Mes préférences</h2>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm">Préférences sauvegardées</div>
        )}

        {isLoading ? (
          <div className="text-center py-20 text-gray-400">Chargement...</div>
        ) : (
          <div className="flex flex-col gap-6">

            {/* Stacks requises */}
            <div className="bg-white rounded-xl border p-5">
              <label className="block text-sm font-medium mb-2">Stacks requises</label>
              <p className="text-xs text-gray-400 mb-3">Seules les offres mentionnant ces technologies seront affichées</p>
              <input
                type="text"
                value={requiredStacksInput}
                onChange={e => setRequiredStacksInput(e.target.value)}
                placeholder="typescript, react, node"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Stacks exclues */}
            <div className="bg-white rounded-xl border p-5">
              <label className="block text-sm font-medium mb-2">Stacks à exclure</label>
              <p className="text-xs text-gray-400 mb-3">Les offres mentionnant ces technologies seront masquées</p>
              <input
                type="text"
                value={excludedStacksInput}
                onChange={e => setExcludedStacksInput(e.target.value)}
                placeholder="java, php, angular, .net"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Mots-clés exclus */}
            <div className="bg-white rounded-xl border p-5">
              <label className="block text-sm font-medium mb-2">Mots-clés à exclure</label>
              <p className="text-xs text-gray-400 mb-3">Les offres contenant ces mots seront masquées</p>
              <input
                type="text"
                value={excludedKeywordsInput}
                onChange={e => setExcludedKeywordsInput(e.target.value)}
                placeholder="senior, lead, confirmé"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Entreprises exclues */}
            <div className="bg-white rounded-xl border p-5">
              <label className="block text-sm font-medium mb-2">Entreprises à exclure</label>
              <p className="text-xs text-gray-400 mb-3">Les offres de ces entreprises seront masquées</p>
              <input
                type="text"
                value={excludedCompaniesInput}
                onChange={e => setExcludedCompaniesInput(e.target.value)}
                placeholder="capgemini, sopra, atos"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Localisation */}
            <div className="bg-white rounded-xl border p-5">
              <label className="block text-sm font-medium mb-2">Localisation</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={filters.departement || ''}
                  onChange={e => setFilters(f => ({ ...f, departement: e.target.value }))}
                  placeholder="Département (ex: 75)"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <input
                  type="number"
                  value={filters.radius || ''}
                  onChange={e => setFilters(f => ({ ...f, radius: parseInt(e.target.value) || undefined }))}
                  placeholder="Rayon (km)"
                  className="w-32 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Options */}
            <div className="bg-white rounded-xl border p-5">
              <label className="block text-sm font-medium mb-4">Options</label>
              <div className="flex flex-col gap-4">

                {/* Remote only */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Télétravail uniquement</span>
                  <button
                    onClick={() => setFilters(f => ({ ...f, remoteOnly: !f.remoteOnly }))}
                    className={`w-12 h-6 rounded-full transition-colors ${filters.remoteOnly ? 'bg-black' : 'bg-gray-200'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${filters.remoteOnly ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Délai de relance */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rappel de relance (jours)</span>
                  <input
                    type="number"
                    value={filters.followUpDays}
                    onChange={e => setFilters(f => ({ ...f, followUpDays: parseInt(e.target.value) || 7 }))}
                    className="w-20 border rounded-lg px-3 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-black"
                    min={1}
                    max={30}
                  />
                </div>

                {/* Expiration */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Marquer comme expirée après (jours)</span>
                  <input
                    type="number"
                    value={filters.expiredAfterDays}
                    onChange={e => setFilters(f => ({ ...f, expiredAfterDays: parseInt(e.target.value) || 14 }))}
                    className="w-20 border rounded-lg px-3 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-black"
                    min={1}
                    max={60}
                  />
                </div>
              </div>
            </div>

            {/* Bouton sauvegarder */}
            <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                {isSaving ? (
                    <>
                    {/* Spinner CSS simple */}
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sauvegarde en cours...
                    </>
                ) : (
                    'Sauvegarder les préférences'
                )}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}