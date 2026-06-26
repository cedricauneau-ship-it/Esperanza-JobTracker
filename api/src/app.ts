import express from 'express'
import 'dotenv/config'
import usersRouter from './users/users.router'
import jobsRouter from './jobs/jobs.router'
import filtersRouter from './filters/filters.router'
import applicationsRouter from './applications/applications.router'
import interviewsRouter from './interviews/interviews.router'
import { startAllCrons } from './cron'

const app = express()

app.use(express.json())

// Routes
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