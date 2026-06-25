import express from 'express'
import 'dotenv/config'
import usersRouter from './users/users.router'
import jobsRouter from './jobs/jobs.router'
import filtersRouter from './filters/filters.router'

const app = express()

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/users', usersRouter)
app.use('/jobs', jobsRouter)
app.use('/filters', filtersRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app