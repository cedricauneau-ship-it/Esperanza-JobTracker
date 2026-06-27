import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import usersRouter from './users/users.router'
import jobsRouter from './jobs/jobs.router'
import filtersRouter from './filters/filters.router'
import applicationsRouter from './applications/applications.router'
import interviewsRouter from './interviews/interviews.router'
import { startAllCrons } from './cron'

const app = express()

// Autorise les requêtes depuis le frontend Next.js
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
}))

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/users', usersRouter)
app.use('/jobs', jobsRouter)
app.use('/filters', filtersRouter)
app.use('/applications', applicationsRouter)
app.use('/interviews', interviewsRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  startAllCrons()
})

export default app