import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../auth/auth.middleware'
import * as applicationsService from './applications.service'

const router = Router()

// POST /applications — crée une candidature pour une offre
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobOfferId, notes } = req.body

    if (!jobOfferId) {
      res.status(400).json({ result: false, error: 'jobOfferId manquant' })
      return
    }

    const application = await applicationsService.createApplication(
      req.user!.userId,
      jobOfferId,
      notes
    )

    res.json({ result: true, application })
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message })
  }
})

// GET /applications — récupère toutes les candidatures de l'utilisateur
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const applications = await applicationsService.getApplications(req.user!.userId)
    res.json({ result: true, applications })
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message })
  }
})

// GET /applications/:id — récupère une candidature par son id
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const application = await applicationsService.getApplicationById(id)

    if (!application) {
      res.status(404).json({ result: false, error: 'Candidature introuvable' })
      return
    }

    res.json({ result: true, application })
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message })
  }
})

// PATCH /applications/:id — met à jour les notes d'une candidature
router.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const { notes } = req.body

    const application = await applicationsService.updateApplication(id, notes)
    res.json({ result: true, application })
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message })
  }
})

// DELETE /applications/:id — supprime une candidature
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const { jobOfferId } = req.body

    if (!jobOfferId) {
      res.status(400).json({ result: false, error: 'jobOfferId manquant' })
      return
    }

    await applicationsService.deleteApplication(id, jobOfferId)
    res.json({ result: true })
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message })
  }
})

export default router