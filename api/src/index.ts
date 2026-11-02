import { Hono } from 'hono'
import { billsRouter } from './routes/bills'
import { homesRouter } from './routes/homes'
import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// Health check endpoint
app.get('/api/health', (c) => c.json({ status: 'ok' }))

// Mount modular sub-routers
app.route('/api', homesRouter)
app.route('/api', billsRouter)

// Global not found and error boundaries
app.notFound((c) => c.json({ error: 'Not found' }, 404))

app.onError((err, c) => {
  return c.json({ error: err.message || 'Internal server error' }, 500)
})

export default app
