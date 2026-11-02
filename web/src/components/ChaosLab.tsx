interface ChaosLabProps {
  sim500Error: boolean
  onToggle500: () => void
  simLatency: boolean
  onToggleLatency: () => void
  isBurstFiring: boolean
  onFireBurst: () => void
}

export function ChaosLab({
  sim500Error,
  onToggle500,
  simLatency,
  onToggleLatency,
  isBurstFiring,
  onFireBurst,
}: ChaosLabProps) {
  return (
    <div className="bento-card">
      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
        Edge Resilience &amp; Fault-Tolerance Testing Console
      </h3>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
        Demonstrates that Edge Worker errors and network faults never crash the frontend or corrupt
        payments.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        {/* Test 1: Fault 500 */}
        <div
          style={{
            padding: 20,
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            background: '#f8fafc',
          }}
        >
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
            1. Edge Case 7: Simulate 500 Fault
          </h4>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
            When enabled, payments simulate dropped network packets. The share stays{' '}
            <strong>unpaid</strong> and displays an error toast.
          </p>
          <button
            type="button"
            className={`btn-v2 ${sim500Error ? 'btn-v2-primary' : 'btn-v2-secondary'}`}
            onClick={onToggle500}
          >
            {sim500Error ? 'Disable 500 Fault' : 'Enable 500 Fault'}
          </button>
        </div>

        {/* Test 2: Latency */}
        <div
          style={{
            padding: 20,
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            background: '#f8fafc',
          }}
        >
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
            2. Edge Case 7: Simulate 1.5s Latency
          </h4>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
            Simulates high-latency mobile edge worker requests to verify non-blocking spinner
            states.
          </p>
          <button
            type="button"
            className={`btn-v2 ${simLatency ? 'btn-v2-primary' : 'btn-v2-secondary'}`}
            onClick={onToggleLatency}
          >
            {simLatency ? 'Disable Latency' : 'Enable 1.5s Latency'}
          </button>
        </div>

        {/* Test 3: Concurrent Burst */}
        <div
          style={{
            padding: 20,
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            background: '#f8fafc',
          }}
        >
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
            3. Edge Cases 4 &amp; 5: Concurrent Double-Submit
          </h4>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
            Fires 2 parallel HTTP POST requests with identical Idempotency-Key simultaneously.
          </p>
          <button
            type="button"
            className="btn-v2 btn-v2-primary"
            disabled={isBurstFiring}
            onClick={onFireBurst}
          >
            {isBurstFiring ? 'Broadcasting...' : '⚡ Fire Concurrent Burst'}
          </button>
        </div>
      </div>
    </div>
  )
}
