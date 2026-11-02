import { Hono } from 'hono'
import { calculateShares } from '../lib/split'
import { isNonEmptyString, isPositiveInteger } from '../lib/validators'
import type { BalanceRow, BillRow, Bindings, HomeRow, MemberRow, ShareDetailRow } from '../types'

export const homesRouter = new Hono<{ Bindings: Bindings }>()

// GET /api/homes - List households
homesRouter.get('/homes', async (c) => {
  const result = await c.env.DB.prepare(
    'SELECT id, name, created_at FROM homes ORDER BY rowid ASC',
  ).all<HomeRow>()
  return c.json({ homes: result.results })
})

// POST /api/homes - Create a household
homesRouter.post('/homes', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const name =
    body && typeof body === 'object' && 'name' in body ? (body as { name: unknown }).name : null

  if (!isNonEmptyString(name)) {
    return c.json({ error: 'name is required' }, 400)
  }

  const id = crypto.randomUUID()
  const trimmedName = name.trim()

  await c.env.DB.prepare('INSERT INTO homes (id, name) VALUES (?, ?)').bind(id, trimmedName).run()

  return c.json({ id, name: trimmedName }, 201)
})

// GET /api/homes/:homeId - Get household with members
homesRouter.get('/homes/:homeId', async (c) => {
  const homeId = c.req.param('homeId')
  const home = await c.env.DB.prepare('SELECT id, name FROM homes WHERE id = ?')
    .bind(homeId)
    .first<HomeRow>()

  if (!home) {
    return c.json({ error: 'Home not found' }, 404)
  }

  const members = await c.env.DB.prepare(
    'SELECT id, home_id AS homeId, name FROM members WHERE home_id = ? ORDER BY rowid ASC',
  )
    .bind(homeId)
    .all<{ id: string; homeId: string; name: string }>()

  return c.json({ id: home.id, name: home.name, members: members.results })
})

// POST /api/homes/:homeId/members - Register a member
homesRouter.post('/homes/:homeId/members', async (c) => {
  const homeId = c.req.param('homeId')

  const home = await c.env.DB.prepare('SELECT id FROM homes WHERE id = ?')
    .bind(homeId)
    .first<HomeRow>()

  if (!home) {
    return c.json({ error: 'Home not found' }, 404)
  }

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const name =
    body && typeof body === 'object' && 'name' in body ? (body as { name: unknown }).name : null

  if (!isNonEmptyString(name)) {
    return c.json({ error: 'name is required' }, 400)
  }

  const id = crypto.randomUUID()
  const trimmedName = name.trim()

  await c.env.DB.prepare('INSERT INTO members (id, home_id, name) VALUES (?, ?, ?)')
    .bind(id, homeId, trimmedName)
    .run()

  return c.json({ id, homeId, name: trimmedName }, 201)
})

// GET /api/homes/:homeId/bills - List bills with shares
homesRouter.get('/homes/:homeId/bills', async (c) => {
  const homeId = c.req.param('homeId')

  const home = await c.env.DB.prepare('SELECT id FROM homes WHERE id = ?')
    .bind(homeId)
    .first<HomeRow>()

  if (!home) {
    return c.json({ error: 'Home not found' }, 404)
  }

  const billsResult = await c.env.DB.prepare(
    'SELECT id, home_id, title, total_cents, created_at FROM bills WHERE home_id = ? ORDER BY rowid DESC',
  )
    .bind(homeId)
    .all<BillRow>()

  const bills = billsResult.results
  const billsWithShares = []

  for (const bill of bills) {
    const sharesResult = await c.env.DB.prepare(
      `SELECT s.id, s.member_id AS memberId, m.name AS memberName, s.amount_cents AS amountCents, s.paid_at AS paidAt
       FROM shares s
       JOIN members m ON s.member_id = m.id
       WHERE s.bill_id = ?
       ORDER BY m.rowid ASC`,
    )
      .bind(bill.id)
      .all<ShareDetailRow>()

    billsWithShares.push({
      id: bill.id,
      homeId: bill.home_id,
      title: bill.title,
      totalCents: bill.total_cents,
      createdAt: bill.created_at,
      shares: sharesResult.results,
    })
  }

  return c.json({ bills: billsWithShares })
})

// POST /api/homes/:homeId/bills - Authorize & split a bill
homesRouter.post('/homes/:homeId/bills', async (c) => {
  const homeId = c.req.param('homeId')

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const totalCents =
    body && typeof body === 'object' && 'totalCents' in body
      ? (body as { totalCents: unknown }).totalCents
      : undefined

  const title =
    body && typeof body === 'object' && 'title' in body
      ? (body as { title: unknown }).title
      : undefined

  if (!isNonEmptyString(title)) {
    return c.json({ error: 'title is required' }, 422)
  }

  if (!isPositiveInteger(totalCents)) {
    return c.json({ error: 'totalCents must be a positive whole number' }, 422)
  }

  const home = await c.env.DB.prepare('SELECT id FROM homes WHERE id = ?')
    .bind(homeId)
    .first<HomeRow>()

  if (!home) {
    return c.json({ error: 'Home not found' }, 404)
  }

  const membersResult = await c.env.DB.prepare(
    'SELECT id, name FROM members WHERE home_id = ? ORDER BY rowid ASC',
  )
    .bind(homeId)
    .all<MemberRow>()

  const members = membersResult.results
  if (members.length === 0) {
    return c.json({ error: 'Home has no members' }, 422)
  }

  const billId = crypto.randomUUID()
  const shares = calculateShares(totalCents, members)

  const statements: D1PreparedStatement[] = [
    c.env.DB.prepare(
      'INSERT INTO bills (id, home_id, title, total_cents) VALUES (?, ?, ?, ?)',
    ).bind(billId, homeId, title.trim(), totalCents),
  ]

  for (const share of shares) {
    statements.push(
      c.env.DB.prepare(
        'INSERT INTO shares (id, bill_id, member_id, amount_cents) VALUES (?, ?, ?, ?)',
      ).bind(share.id, billId, share.memberId, share.amountCents),
    )
  }

  await c.env.DB.batch(statements)

  return c.json(
    {
      id: billId,
      homeId,
      title: title.trim(),
      totalCents,
      shares,
    },
    201,
  )
})

// GET /api/homes/:homeId/balances - Aggregate net balances
homesRouter.get('/homes/:homeId/balances', async (c) => {
  const homeId = c.req.param('homeId')

  const home = await c.env.DB.prepare('SELECT id FROM homes WHERE id = ?')
    .bind(homeId)
    .first<HomeRow>()

  if (!home) {
    return c.json({ error: 'Home not found' }, 404)
  }

  const query = `
    SELECT
      m.id AS memberId,
      m.name AS name,
      COALESCE(SUM(CASE WHEN s.paid_at IS NULL AND s.id IS NOT NULL THEN s.amount_cents ELSE 0 END), 0) AS outstandingCents
    FROM members m
    LEFT JOIN shares s ON s.member_id = m.id
    WHERE m.home_id = ?
    GROUP BY m.id, m.name, m.rowid
    ORDER BY m.rowid ASC
  `

  const result = await c.env.DB.prepare(query).bind(homeId).all<BalanceRow>()

  return c.json({ balances: result.results }, 200)
})
