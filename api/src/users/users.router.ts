import { Router, Request, Response } from 'express'
import * as usersService from './users.service'
import { authMiddleware, AuthRequest } from '../auth/auth.middleware'

const router = Router()

// POST /users/signup
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password } = req.body
    if (!email?.trim() || !username?.trim() || !password?.trim()) {
      res.status(400).json({ result: false, error: 'Champs manquants' })
      return
    }
    const data = await usersService.signup(email.trim(), username.trim(), password)
    res.json({ result: true, ...data })
  } catch (error: any) {
    res.status(400).json({ result: false, error: error.message })
  }
})

// POST /users/signin
router.post('/signin', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body
    if (!email?.trim() || !password?.trim()) {
      res.status(400).json({ result: false, error: 'Champs manquants' })
      return
    }
    const data = await usersService.signin(email.trim(), password)
    res.json({ result: true, ...data })
  } catch (error: any) {
    res.status(400).json({ result: false, error: error.message })
  }
})

// POST /users/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      res.status(400).json({ result: false, error: 'Refresh token manquant' })
      return
    }
    const tokens = await usersService.refreshTokens(refreshToken)
    res.json({ result: true, ...tokens })
  } catch (error: any) {
    res.status(401).json({ result: false, error: error.message })
  }
})

// GET /users/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ result: true, userId: req.user?.userId })
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message })
  }
})

export default router