import type { HomeItem } from '../types'
import { BrandGlyph } from './Icons'

interface SidebarProps {
  homes: HomeItem[]
  selectedHomeId: string
  onSelectHome: (id: string) => void
  loadingHomes: boolean
  activeNav: 'feed' | 'roommates' | 'chaos'
  onSelectNav: (nav: 'feed' | 'roommates' | 'chaos') => void
  billsCount: number
  membersCount: number
  hasMembers: boolean
  onOpenCreateHome: () => void
  onOpenSplitExpense: () => void
}

export function Sidebar({
  homes,
  selectedHomeId,
  onSelectHome,
  loadingHomes,
  activeNav,
  onSelectNav,
  billsCount,
  membersCount,
  hasMembers,
  onOpenCreateHome,
  onOpenSplitExpense,
}: SidebarProps) {
  return (
    <aside className="sidebar-dock">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-wrapper">
          <div className="brand-icon-box">
            <BrandGlyph />
          </div>
          <div className="brand-text">
            <div className="brand-title-wrap">
              <div className="brand-title-text">
                <span className="brand-title-split">Split</span>
                <span className="brand-title-edge">Edge</span>
              </div>
              <span className="brand-badge-pill">D1 • Edge</span>
            </div>
            <span className="brand-subtext">
              <span className="brand-subtext-dot" />
              Autonomous Living Ledger
            </span>
          </div>
        </div>
      </div>

      {/* Household Selector Card */}
      <div className="sidebar-household-card">
        <div className="sidebar-household-label">
          <span>Household</span>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#818cf8',
              cursor: 'pointer',
              fontSize: 11,
            }}
            onClick={onOpenCreateHome}
          >
            + Create
          </button>
        </div>
        <select
          className="household-select-trigger"
          value={selectedHomeId}
          onChange={(e) => onSelectHome(e.target.value)}
          disabled={loadingHomes || homes.length === 0}
          aria-label="Select active household"
        >
          {homes.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      {/* Prominent Sidebar CTA Action Button */}
      <div className="sidebar-cta-wrap">
        <button
          type="button"
          className="btn-sidebar-cta"
          disabled={!hasMembers}
          onClick={onOpenSplitExpense}
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Split An Expense
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <button
          type="button"
          className={`nav-item-btn ${activeNav === 'feed' ? 'active' : ''}`}
          onClick={() => onSelectNav('feed')}
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <span>Expenses &amp; Splits</span>
          <span className="nav-badge-pill">{billsCount}</span>
        </button>

        <button
          type="button"
          className={`nav-item-btn ${activeNav === 'roommates' ? 'active' : ''}`}
          onClick={() => onSelectNav('roommates')}
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Roommate Registry</span>
          <span className="nav-badge-pill">{membersCount}</span>
        </button>

        <button
          type="button"
          className={`nav-item-btn ${activeNav === 'chaos' ? 'active' : ''}`}
          onClick={() => onSelectNav('chaos')}
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Chaos &amp; Edge Lab</span>
        </button>
      </nav>

      {/* Sidebar Footer with Edge Status */}
      <div className="sidebar-footer">
        <div className="edge-indicator">
          <div className="pulse-dot" />
          <span>Cloudflare D1 Local</span>
        </div>
      </div>
    </aside>
  )
}
