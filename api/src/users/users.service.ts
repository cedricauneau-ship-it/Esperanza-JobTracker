import bcrypt from 'bcrypt'
import { prisma } from '../prisma/prisma.service'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../auth/auth.service'

const SALT_ROUNDS = 10

export const signup = async (email: string, username: string, password: string) => {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error('Email déjà utilisé')

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  const user = await prisma.user.create({
    data: { email, username, passwordHash },
  })

  const accessToken = generateAccessToken(user.id)
  const refreshToken = generateRefreshToken(user.id)

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, username: user.username } }
}

export const signin = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error('Email ou mot de passe incorrect')
  }

  const accessToken = generateAccessToken(user.id)
  const refreshToken = generateRefreshToken(user.id)

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, username: user.username } }
}

export const refreshTokens = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken)

  const user = await prisma.user.findUnique({ where: { id: decoded.id } })
  if (!user) throw new Error('Utilisateur introuvable')

  const newAccessToken = generateAccessToken(user.id)
  const newRefreshToken = generateRefreshToken(user.id)

  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}