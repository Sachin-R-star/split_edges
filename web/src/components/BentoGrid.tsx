import { formatCents } from '../lib/formatters'
import type { BalanceItem, MemberItem } from '../types'

interface BentoGridProps {
  totalVolumeCents: number
  totalOwedCents: number
  settledCents: number
  settledRatio: number
  members: MemberItem[]
  balances: BalanceItem[]
  onOpenPreset: (title: string, amount: string) => void
}

export function BentoGrid({
  totalVolumeCents,
  totalOwedCents,
  settledCents,
  settledRatio,
  members,
  balances,
  onOpenPreset,
}: BentoGridProps) {
  return (
    <section className="bento-grid">
      {/* Bento Card 1: Treasury Settlement Gauge */}
      <div className="bento-card bento-card-treasury">
        <div className="bento-card-label">
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Treasury &amp; Settlement Health
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="bento-stat-num">{formatCents(totalVolumeCents)}</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>
            {settledRatio}% Settled
          </span>
        </div>

        <div className="treasury-progress-wrap">
          <div className="treasury-bar-track">
            <div className="treasury-bar-fill" style={{ width: `${settledRatio}%` }} />
          </div>
          <div className="treasury-meta-row">
            <span>Settled: {formatCents(settledCents)}</span>
            <span
              style={{
                color: totalOwedCents > 0 ? '#f43f5e' : '#10b981',
                fontWeight: 600,
              }}
            >
              Outstanding: {formatCents(totalOwedCents)}
            </span>
          </div>
        </div>
      </div>

      {/* Bento Card 2: Roommate Priority Queue */}
      <div className="bento-card bento-card-roommates">
        <div className="bento-card-label">
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          Roommate Split Order ({members.length})
        </div>

        {members.length === 0 ? (
          <div style={{ padding: '12px 0', fontSize: 13, color: '#64748b' }}>
            No roommates yet. Click &quot;Add Roommate&quot; above.
          </div>
        ) : (
          <div className="roommates-mini-strip">
            {members.map((m, idx) => {
              const bal = balances.find((b) => b.memberId === m.id)
              const owes = bal ? bal.outstandingCents : 0

              return (
                <div key={m.id} className="mini-roommate-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#94a3b8',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      #{idx + 1}
                    </span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{m.name}</span>
                    {idx === 0 && (
                      <span
                        style={{
                          fontSize: 9,
                          background: '#eef2ff',
                          color: '#4f46e5',
                          padding: '1px 5px',
                          borderRadius: 4,
                          fontWeight: 700,
                        }}
                      >
                        Remainder Lead
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: owes > 0 ? '#f43f5e' : '#10b981',
                    }}
                  >
                    {owes > 0 ? formatCents(owes) : 'Settled'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bento Card 3: 1-Click Expense Quicksplit Presets */}
      <div className="bento-card bento-card-quicksplit">
        <div className="bento-card-label">
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          1-Click Presets
        </div>

        <div className="quicksplit-grid">
          <button
            type="button"
            className="btn-preset-tile"
            disabled={members.length === 0}
            onClick={() => onOpenPreset('WiFi Internet', '45.00')}
          >
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 13a10 10 0 0 1 14 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
            WiFi $45
          </button>

          <button
            type="button"
            className="btn-preset-tile"
            disabled={members.length === 0}
            onClick={() => onOpenPreset('Groceries Store', '80.00')}
          >
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2 2h3l2.5 12h10l2-8H6" />
            </svg>
            Grocery $80
          </button>

          <button
            type="button"
            className="btn-preset-tile"
            disabled={members.length === 0}
            onClick={() => onOpenPreset('Electric Utility', '120.00')}
          >
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Power $120
          </button>

          <button
            type="button"
            className="btn-preset-tile"
            disabled={members.length === 0}
            onClick={() => onOpenPreset('Apartment Rent', '900.00')}
          >
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            Rent $900
          </button>
        </div>
      </div>
    </section>
  )
}
