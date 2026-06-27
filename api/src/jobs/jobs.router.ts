import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../auth/auth.middleware'
import * as jobsService from './jobs.service'
import { runScrapers } from '../scrapers'

const router = Router()

// GET /jobs?page=1 — DOIT être avant /:id
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const result = await jobsService.getJobs(req.user!.userId, page)
    const { jobs, pagination } = result
    res.json({ result: true, jobs, pagination })
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message })
  }
})

// GET /jobs/:id — après la route /
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const job = await jobsService.getJobById(id)
    if (!job) {
      res.status(404).json({ result: false, error: 'Offre introuvable' })
      return
    }
    res.json({ result: true, job })
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message })
  }
})

// PATCH /jobs/:id/status
router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body
    const validStatuses = ['to_review', 'ignored', 'applied', 'interview', 'rejected', 'offer']
    if (!validStatuses.includes(status)) {
      res.status(400).json({ result: false, error: 'Statut invalide' })
      return
    }
    const id = req.params.id as string
    const job = await jobsService.updateJobStatus(id, status)
    res.json({ result: true, job })
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message })
  }
})

// DELETE /jobs/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    await jobsService.deleteJob(id)
    res.json({ result: true })
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message })
  }
})

// POST /jobs/scrape
router.post('/scrape', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await runScrapers(req.user!.userId)
    res.json({ result: true, message: 'Scraping terminé' })
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message })
  }
})

export default router