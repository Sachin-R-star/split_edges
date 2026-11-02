import { formatCents } from '../lib/formatters'
import type { BalanceItem, MemberItem } from '../types'

interface RoommateRegistryProps {
  members: MemberItem[]
  balances: BalanceItem[]
  onOpenAddRoommate: () => void
}

export function RoommateRegistry({ members, balances, onOpenAddRoommate }: RoommateRegistryProps) {
  return (
    <div className="bento-card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
        }}
      >
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>
            Roommate Registry &amp; Priority Sequence
          </h3>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            Ordering in SQLite preserves remainder cent allocation priority.
          </p>
        </div>
        <button type="button" className="btn-v2 btn-v2-primary" onClick={onOpenAddRoommate}>
          + Register Roommate
        </button>
      </div>

      <table className="shares-grid-table" style={{ borderTop: 'none' }}>
        <thead>
          <tr>
            <th>Sequence Priority</th>
            <th>Roommate Name</th>
            <th>Unique ID Ref</th>
            <th style={{ textAlign: 'right' }}>Net Outstanding</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m, idx) => {
            const bal = balances.find((b) => b.memberId === m.id)
            const owes = bal ? bal.outstandingCents : 0

            return (
              <tr key={m.id}>
                <td>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      background: '#e2e8f0',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontWeight: 700,
                    }}
                  >
                    #{idx + 1} {idx === 0 ? '(Remainder Lead)' : ''}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="user-avatar-tag">{m.name.slice(0, 2).toUpperCase()}</div>
                    <span style={{ fontWeight: 600 }}>{m.name}</span>
                  </div>
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#64748b' }}>
                    {m.id}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: owes > 0 ? '#f43f5e' : '#10b981',
                    }}
                  >
                    {owes > 0 ? formatCents(owes) : 'Settled ✨'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
