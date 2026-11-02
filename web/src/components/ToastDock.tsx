import type { ToastMessage } from '../types'

interface ToastDockProps {
  toasts: ToastMessage[]
  onRemoveToast: (id: string) => void
}

export function ToastDock({ toasts, onRemoveToast }: ToastDockProps) {
  return (
    <div className="toast-dock">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-pill ${t.type}`}>
          <span>{t.text}</span>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: 15,
            }}
            onClick={() => onRemoveToast(t.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

