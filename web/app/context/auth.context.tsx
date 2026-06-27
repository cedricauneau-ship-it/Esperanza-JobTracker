'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface User {
  userId: string
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  signin: (email: string, password: string) => Promise<void>
  signup: (email: string, username: string, password: string) => Promise<void>
  signout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 30}`
}

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? match[2] : null
}

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0`
}

export function AuthProvider({ children }: { children: ReactNode }) {

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return getCookie('accessToken')
  })

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    const token = getCookie('accessToken')
    return token ? { userId: '' } : null
  })

  // isLoading est false par défaut — plus de chargement asynchrone au démarrage
  const isLoading = false

  const signin = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/users/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()
    if (!data.result) throw new Error(data.error)

    setCookie('accessToken', data.accessToken)
    setCookie('refreshToken', data.refreshToken)

    setAccessToken(data.accessToken)
    setUser({ userId: data.user.id })
  }

  const signup = async (email: string, username: string, password: string) => {
    const response = await fetch(`${API_URL}/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    })

    const data = await response.json()
    if (!data.result) throw new Error(data.error)

    setCookie('accessToken', data.accessToken)
    setCookie('refreshToken', data.refreshToken)

    setAccessToken(data.accessToken)
    setUser({ userId: data.user.id })
  }

  const signout = () => {
    deleteCookie('accessToken')
    deleteCookie('refreshToken')
    setAccessToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, signin, signup, signout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return context
}