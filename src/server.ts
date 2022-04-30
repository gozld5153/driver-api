import express, { urlencoded } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import mapRoute from './routes/map'
import setupRoute from './routes/setup'
import dataSource from './db/data-source'

const app = express()

app.use(express.json())
app.use(morgan('dev'))
app.use(cookieParser())
app.use(cors())
app.use(urlencoded({ extended: false }))

app.use('/map', mapRoute)
app.use('/setup', setupRoute)
app.get('/', (_, res) => res.send('hello'))

const PORT = process.env.PORT || 5030
app.listen(PORT, async () => {
  try {
    await dataSource.initialize()
    console.log(`db connected at ${new Date()}`)

    console.log(`server running at http://localhost:${PORT}`)
  } catch (error) {
    console.log({ startupError: error })
  }
})
