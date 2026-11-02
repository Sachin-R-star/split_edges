import { Hono } from 'hono'
import { isNonEmptyString } from '../lib/validators'
import type { BillRow, Bindings, ShareRow } from '../types'

export const billsRouter = new Hono<{ Bindings: Bindings }>()

// POST /api/bills/:billId/shares/:shareId/pay - Atomic payment with idempotency
billsRouter.post('/bills/:billId/shares/:shareId/pay', async (c) => {
  const billId = c.req.param('billId')
  const shareId = c.req.param('shareId')

  const idempotencyKey = c.req.header('Idempotency-Key')
  if (!isNonEmptyString(idempotencyKey)) {
    return c.json({ error: 'Idempotency-Key header is required' }, 400)
  }
  const key = idempotencyKey.trim()

  const bill = await c.env.DB.prepare('SELECT id FROM bills WHERE id = ?')
    .bind(billId)
    .first<BillRow>()

  if (!bill) {
    return c.json({ error: 'Bill not found' }, 404)
  }

  const share = await c.env.DB.prepare('SELECT * FROM shares WHERE id = ? AND bill_id = ?')
    .bind(shareId, billId)
    .first<ShareRow>()

  if (!share) {
    return c.json({ error: 'Share not found' }, 404)
  }

  // Already settled check
  if (share.paid_at !== null) {
    if (share.idempotency_key === key) {
      return c.json(
        {
          id: share.id,
          memberId: share.member_id,
          amountCents: share.amount_cents,
          paidAt: share.paid_at,
        },
        200,
      )
    }
    return c.json({ error: 'Share already paid' }, 409)
  }

  // Atomic conditional update to handle concurrent double-submits
  const now = new Date().toISOString()
  const updateResult = await c.env.DB.prepare(
    'UPDATE shares SET paid_at = ?, idempotency_key = ? WHERE id = ? AND bill_id = ? AND paid_at IS NULL',
  )
    .bind(now, key, shareId, billId)
    .run()

  if (updateResult.meta.changes === 1) {
    return c.json(
      {
        id: share.id,
        memberId: share.member_id,
        amountCents: share.amount_cents,
        paidAt: now,
      },
      200,
    )
  }

  // If another concurrent request completed the payment in the same cycle:
  const freshShare = await c.env.DB.prepare('SELECT * FROM shares WHERE id = ? AND bill_id = ?')
    .bind(shareId, billId)
    .first<ShareRow>()

  if (freshShare && freshShare.paid_at !== null && freshShare.idempotency_key === key) {
    return c.json(
      {
        id: freshShare.id,
        memberId: freshShare.member_id,
        amountCents: freshShare.amount_cents,
        paidAt: freshShare.paid_at,
      },
      200,
    )
  }

  return c.json({ error: 'Share already paid' }, 409)
})
