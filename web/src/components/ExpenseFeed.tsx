import { formatCents, formatDate } from '../lib/formatters'
import type { BillItem, MemberItem } from '../types'
import { CategoryIcon } from './Icons'

interface ExpenseFeedProps {
  bills: BillItem[]
  members: MemberItem[]
  feedFilter: 'all' | 'unpaid' | 'settled'
  onFilterChange: (filter: 'all' | 'unpaid' | 'settled') => void
  loadingDetails: boolean
  payingShareId: string | null
  onPayShare: (billId: string, shareId: string) => void
}

export function ExpenseFeed({
  bills,
  members,
  feedFilter,
  onFilterChange,
  loadingDetails,
  payingShareId,
  onPayShare,
}: ExpenseFeedProps) {
  const filteredBills = bills.filter((b) => {
    if (feedFilter === 'unpaid') return b.shares.some((s) => s.paidAt === null)
    if (feedFilter === 'settled') return b.shares.every((s) => s.paidAt !== null)
    return true
  })

  return (
    <div>
      <div className="feed-header-bar">
        <h2 className="feed-title">Financial Expense Feed</h2>

        <div className="feed-filter-tabs">
          <button
            type="button"
            className={`feed-filter-btn ${feedFilter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange('all')}
          >
            All ({bills.length})
          </button>
          <button
            type="button"
            className={`feed-filter-btn ${feedFilter === 'unpaid' ? 'active' : ''}`}
            onClick={() => onFilterChange('unpaid')}
          >
            Pending Settle
          </button>
          <button
            type="button"
            className={`feed-filter-btn ${feedFilter === 'settled' ? 'active' : ''}`}
            onClick={() => onFilterChange('settled')}
          >
            Fully Settled
          </button>
        </div>
      </div>

      {loadingDetails ? (
        <div
          className="bento-card"
          style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}
        >
          <div
            className="spin-indicator"
            style={{ borderTopColor: '#4f46e5', width: 20, height: 20, margin: '0 auto 10px' }}
          />
          <p>Loading expense vouchers...</p>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="bento-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            {members.length === 0
              ? 'Add roommates first before recording expenses.'
              : 'No bills match the current view filter.'}
          </p>
        </div>
      ) : (
        <div>
          {filteredBills.map((bill) => {
            const allPaid = bill.shares.every((s) => s.paidAt !== null)
            const paidCount = bill.shares.filter((s) => s.paidAt !== null).length

            return (
              <div key={bill.id} className="expense-voucher-card">
                <div className="voucher-top">
                  <div className="voucher-category-icon">
                    <CategoryIcon title={bill.title} />
                  </div>

                  <div className="voucher-details-col">
                    <h3 className="voucher-expense-name">{bill.title}</h3>
                    <div className="voucher-subtext">
                      Ref: #{bill.id.slice(0, 8)} &middot; {formatDate(bill.createdAt)}
                    </div>
                  </div>

                  <div className="voucher-cost-box">
                    <div className="voucher-grand-total">{formatCents(bill.totalCents)}</div>
                    <span className={`settlement-pill ${allPaid ? 'done' : 'pending'}`}>
                      {allPaid ? '✓ Fully Settled' : `${paidCount} / ${bill.shares.length} Settled`}
                    </span>
                  </div>
                </div>

                {/* Shares Table */}
                <table className="shares-grid-table">
                  <thead>
                    <tr>
                      <th>Roommate</th>
                      <th>Exact Split</th>
                      <th>Settlement State</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.shares.map((share) => {
                      const isPaid = share.paidAt !== null
                      const isPaying = payingShareId === share.id
                      const memberName =
                        share.memberName ||
                        members.find((m) => m.id === share.memberId)?.name ||
                        'Roommate'

                      return (
                        <tr key={share.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="user-avatar-tag">
                                {memberName.slice(0, 2).toUpperCase()}
                              </div>
                              <span style={{ fontWeight: 600 }}>{memberName}</span>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                              {formatCents(share.amountCents)}
                            </span>
                          </td>
                          <td>
                            {isPaid ? (
                              <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                                ✓ Paid {share.paidAt ? formatDate(share.paidAt) : ''}
                              </span>
                            ) : (
                              <span style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>
                                ⏳ Unpaid Liability
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {isPaid ? (
                              <span style={{ fontSize: 12, color: '#64748b' }}>Cleared</span>
                            ) : (
                              <button
                                type="button"
                                className="btn-pay-action"
                                disabled={isPaying}
                                onClick={() => onPayShare(bill.id, share.id)}
                              >
                                {isPaying ? (
                                  <>
                                    <div className="spin-indicator" />
                                    Settling...
                                  </>
                                ) : (
                                  'Pay Share'
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

