interface TopbarProps {
  householdName: string
  onOpenAddRoommate: () => void
}

export function Topbar({ householdName, onOpenAddRoommate }: TopbarProps) {
  return (
    <header className="canvas-topbar">
      <div className="breadcrumbs">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
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
          Household
        </span>
        <span style={{ color: '#cbd5e1' }}>/</span>
        <span className="current">
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#10b981',
              display: 'inline-block',
            }}
          />
          {householdName}
        </span>
      </div>

      <div className="topbar-actions">
        <button type="button" className="btn-v2 btn-v2-secondary" onClick={onOpenAddRoommate}>
          <svg
            aria-hidden="true"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          Add Roommate
        </button>
      </div>
    </header>
  )
}
