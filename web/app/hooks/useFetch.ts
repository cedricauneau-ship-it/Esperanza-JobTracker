'use client'

import { useAuth } from '../context/auth.context'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export function useFetch() {
  const { accessToken, signout } = useAuth()

  // Fonction principale qui gère les appels API avec le token JWT
  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        // Ajoute le token JWT dans le header Authorization
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      },
    })

    // Si le token est expiré, on déconnecte l'utilisateur
    // Plus tard on pourra ajouter le refresh token automatique ici
    if (response.status === 401) {
      signout()
      throw new Error('Session expirée, veuillez vous reconnecter')
    }

    const data = await response.json()

    if (!data.result) {
      throw new Error(data.error || 'Une erreur est survenue')
    }

    return data
  }

  return { fetchWithAuth }
}