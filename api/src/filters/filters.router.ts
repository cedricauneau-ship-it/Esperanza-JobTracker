import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../auth/auth.middleware'
import * as filtersService from './filters.service'

const router = Router()

// GET /filters
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filters = await filtersService.getUserFilters(req.user!.userId)
    res.json({ result: true, filters })
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message })
  }
})

// PUT /filters
router.put('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filters = await filtersService.upsertUserFilters(req.user!.userId, req.body)
    res.json({ result: true, filters })
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message })
  }
})

// DELETE /filters
router.delete('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await filtersService.deleteUserFilters(req.user!.userId)
    res.json({ result: true })
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message })
  }
})

export default router