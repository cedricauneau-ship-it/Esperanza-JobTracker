import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from './auth.service'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: { userId: string }
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    res.status(401).json({ result: false, error: 'Token manquant' })
    return
  }

  const cleanToken = token.replace(/^"|"$/g, '')

  try {
    const decoded = verifyAccessToken(cleanToken)
    req.user = { userId: decoded.id }
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ result: false, error: 'Token expiré', code: 'TOKEN_EXPIRED' })
    } else {
      res.status(401).json({ result: false, error: 'Token invalide' })
    }
  }
}