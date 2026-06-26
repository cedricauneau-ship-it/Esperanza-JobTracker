import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../auth/auth.middleware'
import * as interviewsService from './interviews.service'

const router = Router()

// POST /interviews — crée un entretien lié à une candidature
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { applicationId, scheduledAt, type, notes } = req.body

    if (!applicationId || !scheduledAt || !type) {
      res.status(400).json({ result: false, error: 'applicationId, scheduledAt et type sont requis' })
      return
    }

    // Types valides : phone, technical, fit, final
    const validTypes = ['phone', 'technical', 'fit', 'final']
    if (!validTypes.includes(type)) {
      res.status(400).json({ result: false, error: `Type invalide. Types valides : ${validTypes.join(', ')}` })
      return
    }

    const interview = await interviewsService.createInterview(
      applicationId,
      new Date(scheduledAt),
      type,
      notes
    )

    res.json({ result: true, interview })
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message })
  }
})

// GET /interviews/:applicationId — récupère tous les entretiens d'une candidature
router.get('/:applicationId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const applicationId = req.params.applicationId as string
    const interviews = await interviewsService.getInterviews(applicationId)
    res.json({ result: true, interviews })
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message })
  }
})

// PATCH /interviews/:id — met à jour un entretien
router.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const { scheduledAt, type, notes } = req.body

    const interview = await interviewsService.updateInterview(id, {
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      type,
      notes,
    })

    res.json({ result: true, interview })
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message })
  }
})

// DELETE /interviews/:id — supprime un entretien
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    await interviewsService.deleteInterview(id)
    res.json({ result: true })
  } catch (error: any) {
    res.status(500).json({ result: false, error: error.message })
  }
})

export default router