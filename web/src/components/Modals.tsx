import { formatCents } from '../lib/formatters'

interface CreateHomeModalProps {
  isOpen: boolean
  onClose: () => void
  name: string
  onChangeName: (val: string) => void
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
}

export function CreateHomeModal({
  isOpen,
  onClose,
  name,
  onChangeName,
  onSubmit,
  isSubmitting,
}: CreateHomeModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop-v2" role="dialog" aria-modal="true">
      <button
        type="button"
        className="modal-backdrop-hitarea"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="modal-surface-card">
        <div className="modal-head">
          <h3>Initialize New Household</h3>
          <button type="button" className="modal-btn-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-content-area">
            <div className="input-group-row">
              <label className="input-label-text" htmlFor="household-input-name">
                Household Name
              </label>
              <input
                id="household-input-name"
                type="text"
                className="input-text-field"
                placeholder="e.g. Flat 4B, Baker Street"
                value={name}
                onChange={(e) => onChangeName(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>
          <div className="modal-actions-bar">
            <button
              type="button"
              className="btn-v2 btn-v2-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-v2 btn-v2-primary"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? 'Initializing...' : 'Create Household'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface AddRoommateModalProps {
  isOpen: boolean
  onClose: () => void
  name: string
  onChangeName: (val: string) => void
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
}

export function AddRoommateModal({
  isOpen,
  onClose,
  name,
  onChangeName,
  onSubmit,
  isSubmitting,
}: AddRoommateModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop-v2" role="dialog" aria-modal="true">
      <button
        type="button"
        className="modal-backdrop-hitarea"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="modal-surface-card">
        <div className="modal-head">
          <h3>Register Roommate</h3>
          <button type="button" className="modal-btn-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-content-area">
            <div className="input-group-row">
              <label className="input-label-text" htmlFor="member-input-name">
                Roommate Name
              </label>
              <input
                id="member-input-name"
                type="text"
                className="input-text-field"
                placeholder="e.g. Asha, Ben, Chitra"
                value={name}
                onChange={(e) => onChangeName(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                Order added determines remainder cent priority during uneven splits.
              </p>
            </div>
          </div>
          <div className="modal-actions-bar">
            <button
              type="button"
              className="btn-v2 btn-v2-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-v2 btn-v2-primary"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? 'Adding...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface SplitBillModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  onChangeTitle: (val: string) => void
  amountDollars: string
  onChangeAmount: (val: string) => void
  memberCount: number
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
}

export function SplitBillModal({
  isOpen,
  onClose,
  title,
  onChangeTitle,
  amountDollars,
  onChangeAmount,
  memberCount,
  onSubmit,
  isSubmitting,
}: SplitBillModalProps) {
  if (!isOpen) return null

  const dollars = parseFloat(amountDollars)
  const cents = !Number.isNaN(dollars) && dollars > 0 ? Math.round(dollars * 100) : 0
  const base = memberCount > 0 ? Math.floor(cents / memberCount) : 0
  const remainder = memberCount > 0 ? cents % memberCount : 0

  return (
    <div className="modal-backdrop-v2" role="dialog" aria-modal="true">
      <button
        type="button"
        className="modal-backdrop-hitarea"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="modal-surface-card">
        <div className="modal-head">
          <h3>Authorize &amp; Split Expense</h3>
          <button type="button" className="modal-btn-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-content-area">
            <div className="input-group-row">
              <label className="input-label-text" htmlFor="bill-input-title">
                Expense Title
              </label>
              <input
                id="bill-input-title"
                type="text"
                className="input-text-field"
                placeholder="e.g. WiFi Fiber, Groceries"
                value={title}
                onChange={(e) => onChangeTitle(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="input-group-row">
              <label className="input-label-text" htmlFor="bill-input-dollars">
                Total Amount ($ USD)
              </label>
              <input
                id="bill-input-dollars"
                type="number"
                step="0.01"
                min="0.01"
                className="input-text-field"
                placeholder="e.g. 10.00"
                value={amountDollars}
                onChange={(e) => onChangeAmount(e.target.value)}
                disabled={isSubmitting}
                required
              />

              {/* Smart Allocation Breakdown Preview */}
              {cents > 0 && memberCount > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    padding: '10px 14px',
                    background: '#f1f5f9',
                    borderRadius: 8,
                    fontSize: 12,
                    color: '#334155',
                  }}
                >
                  <div>
                    <strong>Cent Total:</strong> {cents} cents &middot; Split among {memberCount}{' '}
                    roommates
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <strong>Base Share:</strong> {base} cents ({formatCents(base)})
                    {remainder > 0 && (
                      <span style={{ color: '#4f46e5', fontWeight: 600, marginLeft: 6 }}>
                        + 1 extra cent allocated to priority #
                        {remainder === 1 ? '1' : `1-${remainder}`}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="modal-actions-bar">
            <button
              type="button"
              className="btn-v2 btn-v2-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-v2 btn-v2-primary"
              disabled={isSubmitting || !title.trim() || !amountDollars}
            >
              {isSubmitting ? 'Calculating...' : 'Authorize Split'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
