'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './context/auth.context'

export default function Home() {
  // Mode : connexion ou inscription
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  // Champs du formulaire
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // États UI
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { signin, signup } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (mode === 'signin') {
        await signin(email, password)
      } else {
        await signup(email, username, password)
      }
      // Redirige vers le dashboard après connexion
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

        {/* Titre */}
        <h1 className="text-2xl font-bold text-center mb-2">Esperanza</h1>
        <p className="text-gray-500 text-center mb-6">Job Tracker</p>

        {/* Onglets signin / signup */}
        <div className="flex mb-6 border-b">
          <button
            className={`flex-1 pb-2 text-sm font-medium ${mode === 'signin' ? 'border-b-2 border-black' : 'text-gray-400'}`}
            onClick={() => setMode('signin')}
          >
            Connexion
          </button>
          <button
            className={`flex-1 pb-2 text-sm font-medium ${mode === 'signup' ? 'border-b-2 border-black' : 'text-gray-400'}`}
            onClick={() => setMode('signup')}
          >
            Inscription
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />

          {/* Champ username uniquement en mode inscription */}
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          )}

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />

          {/* Message d'erreur */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-black text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Chargement...' : mode === 'signin' ? 'Se connecter' : 'S\'inscrire'}
          </button>
        </form>
      </div>
    </main>
  )
}