import jwt from 'jsonwebtoken'
import 'dotenv/config'

const JWT_SECRET = process.env.JWT_SECRET!
const REFRESH_SECRET = process.env.REFRESH_SECRET!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '30d'

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions)
}

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  } as jwt.SignOptions)
}

export const verifyAccessToken = (token: string): { id: string } => {
  return jwt.verify(token, JWT_SECRET) as { id: string }
}

export const verifyRefreshToken = (token: string): { id: string } => {
  return jwt.verify(token, REFRESH_SECRET) as { id: string }
}