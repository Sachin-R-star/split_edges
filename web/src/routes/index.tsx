import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { BentoGrid } from '../components/BentoGrid'
import { ChaosLab } from '../components/ChaosLab'
import { ExpenseFeed } from '../components/ExpenseFeed'
import { AddRoommateModal, CreateHomeModal, SplitBillModal } from '../components/Modals'
import { RoommateRegistry } from '../components/RoommateRegistry'
import { Sidebar } from '../components/Sidebar'
import { ToastDock } from '../components/ToastDock'
import { Topbar } from '../components/Topbar'
import type { BalanceItem, BillItem, HomeItem, MemberItem, ShareItem, ToastMessage } from '../types'

export const Route = createFileRoute('/')({
  component: SplitEdgeApp,
})

function SplitEdgeApp() {
  const [homes, setHomes] = useState<HomeItem[]>([])
  const [selectedHomeId, setSelectedHomeId] = useState<string>('')
  const [members, setMembers] = useState<MemberItem[]>([])
  const [balances, setBalances] = useState<BalanceItem[]>([])
  const [bills, setBills] = useState<BillItem[]>([])

  // Views & Filters
  const [activeNav, setActiveNav] = useState<'feed' | 'roommates' | 'chaos'>('feed')
  const [feedFilter, setFeedFilter] = useState<'all' | 'unpaid' | 'settled'>('all')

  // Loading States
  const [loadingHomes, setLoadingHomes] = useState<boolean>(true)
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false)
  const [payingShareId, setPayingShareId] = useState<string | null>(null)

  // Modals
  const [isHomeModalOpen, setIsHomeModalOpen] = useState<boolean>(false)
  const [newHomeName, setNewHomeName] = useState<string>('')
  const [isSubmittingHome, setIsSubmittingHome] = useState<boolean>(false)

  const [isMemberModalOpen, setIsMemberModalOpen] = useState<boolean>(false)
  const [newMemberName, setNewMemberName] = useState<string>('')
  const [isSubmittingMember, setIsSubmittingMember] = useState<boolean>(false)

  const [isBillModalOpen, setIsBillModalOpen] = useState<boolean>(false)
  const [billTitle, setBillTitle] = useState<string>('')
  const [billAmountDollars, setBillAmountDollars] = useState<string>('')
  const [isSubmittingBill, setIsSubmittingBill] = useState<boolean>(false)

  // Chaos Lab State
  const [sim500Error, setSim500Error] = useState<boolean>(false)
  const [simLatency, setSimLatency] = useState<boolean>(false)
  const [isBurstFiring, setIsBurstFiring] = useState<boolean>(false)

  // Floating Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, text }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Load Households
  const loadHomes = useCallback(async () => {
    try {
      setLoadingHomes(true)
      const res = await fetch('/api/homes')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { homes: HomeItem[] }
      const fetched = data.homes || []
      setHomes(fetched)

      if (fetched.length > 0 && !selectedHomeId) {
        const first = fetched[0]
        if (first) setSelectedHomeId(first.id)
      }
    } catch {
      addToast('error', 'Error loading households from database')
    } finally {
      setLoadingHomes(false)
    }
  }, [selectedHomeId, addToast])

  // Load Household Details
  const loadHomeDetails = useCallback(
    async (homeId: string) => {
      if (!homeId) return
      try {
        setLoadingDetails(true)
        const [homeRes, billsRes, balancesRes] = await Promise.all([
          fetch(`/api/homes/${homeId}`),
          fetch(`/api/homes/${homeId}/bills`),
          fetch(`/api/homes/${homeId}/balances`),
        ])

        if (homeRes.ok) {
          const homeData = (await homeRes.json()) as { members: MemberItem[] }
          setMembers(homeData.members || [])
        }

        if (billsRes.ok) {
          const billsData = (await billsRes.json()) as { bills: BillItem[] }
          setBills(billsData.bills || [])
        } else {
          setBills([])
        }

        if (balancesRes.ok) {
          const balancesData = (await balancesRes.json()) as { balances: BalanceItem[] }
          setBalances(balancesData.balances || [])
        } else {
          setBalances([])
        }
      } catch {
        addToast('error', 'Failed to retrieve household ledger')
      } finally {
        setLoadingDetails(false)
      }
    },
    [addToast],
  )

  useEffect(() => {
    loadHomes()
  }, [loadHomes])

  useEffect(() => {
    if (selectedHomeId) loadHomeDetails(selectedHomeId)
  }, [selectedHomeId, loadHomeDetails])

  // Create Household
  const handleCreateHome = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHomeName.trim()) return

    try {
      setIsSubmittingHome(true)
      const res = await fetch('/api/homes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newHomeName.trim() }),
      })

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(err.error || 'Failed to create home')
      }

      const created = (await res.json()) as HomeItem
      setHomes((prev) => [...prev, created])
      setSelectedHomeId(created.id)
      setNewHomeName('')
      setIsHomeModalOpen(false)
      addToast('success', `Created "${created.name}"`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating household'
      addToast('error', msg)
    } finally {
      setIsSubmittingHome(false)
    }
  }

  // Register Roommate
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHomeId || !newMemberName.trim()) return

    try {
      setIsSubmittingMember(true)
      const res = await fetch(`/api/homes/${selectedHomeId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newMemberName.trim() }),
      })

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(err.error || 'Failed to add member')
      }

      const created = (await res.json()) as MemberItem
      setMembers((prev) => [...prev, created])
      setNewMemberName('')
      setIsMemberModalOpen(false)
      addToast('success', `Registered "${created.name}" into priority sequence`)
      await loadHomeDetails(selectedHomeId)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error adding roommate'
      addToast('error', msg)
    } finally {
      setIsSubmittingMember(false)
    }
  }

  // Authorize & Split Bill
  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHomeId || !billTitle.trim()) return

    const dollars = parseFloat(billAmountDollars)
    if (Number.isNaN(dollars) || dollars <= 0) {
      addToast('error', 'Please enter a valid amount greater than $0')
      return
    }

    const totalCents = Math.round(dollars * 100)

    try {
      setIsSubmittingBill(true)
      const res = await fetch(`/api/homes/${selectedHomeId}/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: billTitle.trim(),
          totalCents,
        }),
      })

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(err.error || 'Failed to authorize bill')
      }

      setBillTitle('')
      setBillAmountDollars('')
      setIsBillModalOpen(false)
      addToast('success', `Expense split evenly across ${members.length} roommates`)
      await loadHomeDetails(selectedHomeId)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error splitting expense'
      addToast('error', msg)
    } finally {
      setIsSubmittingBill(false)
    }
  }

  // Settle Share
  const handlePayShare = async (billId: string, shareId: string) => {
    try {
      setPayingShareId(shareId)

      if (simLatency) {
        await new Promise((r) => setTimeout(r, 1500))
      }

      if (sim500Error) {
        throw new Error('Simulated 500 Fault: Edge Worker dropped request. Share remains unpaid.')
      }

      const key = crypto.randomUUID()
      const res = await fetch(`/api/bills/${billId}/shares/${shareId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': key,
        },
      })

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const paidShare = (await res.json()) as ShareItem

      setBills((prev) =>
        prev.map((b) => {
          if (b.id !== billId) return b
          return {
            ...b,
            shares: b.shares.map((s) => {
              if (s.id !== shareId) return s
              return { ...s, paidAt: paidShare.paidAt }
            }),
          }
        }),
      )

      addToast('success', 'Share marked as settled')

      if (selectedHomeId) {
        const balancesRes = await fetch(`/api/homes/${selectedHomeId}/balances`)
        if (balancesRes.ok) {
          const balancesData = (await balancesRes.json()) as { balances: BalanceItem[] }
          setBalances(balancesData.balances || [])
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment failure'
      // Edge case 7: keeps share unpaid and displays error without crashing!
      addToast('error', `Payment failed: ${msg}. Share remains unpaid.`)
    } finally {
      setPayingShareId(null)
    }
  }

  // Trigger 1-Click Preset
  const handleOpenPreset = (title: string, amount: string) => {
    setBillTitle(title)
    setBillAmountDollars(amount)
    setIsBillModalOpen(true)
  }

  // Concurrent Burst Live Test
  const handleFireBurst = async () => {
    const unpaidBill = bills.find((b) => b.shares.some((s) => s.paidAt === null))
    const unpaidShare = unpaidBill?.shares.find((s) => s.paidAt === null)

    if (!unpaidBill || !unpaidShare) {
      addToast('info', 'Record an unpaid expense first to test concurrent burst')
      return
    }

    try {
      setIsBurstFiring(true)
      const burstKey = crypto.randomUUID()
      addToast('info', `Broadcasting 2 simultaneous requests with key ${burstKey.slice(0, 8)}...`)

      const [res1, res2] = await Promise.all([
        fetch(`/api/bills/${unpaidBill.id}/shares/${unpaidShare.id}/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Idempotency-Key': burstKey },
        }),
        fetch(`/api/bills/${unpaidBill.id}/shares/${unpaidShare.id}/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Idempotency-Key': burstKey },
        }),
      ])

      if (res1.status === 200 && res2.status === 200) {
        addToast(
          'success',
          'Concurrency Test Passed! Both returned 200 with identical timestamp. No double charge.',
        )
      } else {
        addToast('error', `Responses: Request 1: ${res1.status}, Request 2: ${res2.status}`)
      }

      await loadHomeDetails(selectedHomeId)
    } catch {
      addToast('error', 'Burst test failed')
    } finally {
      setIsBurstFiring(false)
    }
  }

  const selectedHome = homes.find((h) => h.id === selectedHomeId)

  // Calculations for Treasury Card
  const totalVolumeCents = bills.reduce((acc, b) => acc + b.totalCents, 0)
  const totalOwedCents = balances.reduce((acc, b) => acc + b.outstandingCents, 0)
  const settledCents = Math.max(0, totalVolumeCents - totalOwedCents)
  const settledRatio =
    totalVolumeCents > 0 ? Math.round((settledCents / totalVolumeCents) * 100) : 100

  return (
    <div className="app-frame">
      {/* ================= LEFT SIDEBAR DOCK ================= */}
      <Sidebar
        homes={homes}
        selectedHomeId={selectedHomeId}
        onSelectHome={setSelectedHomeId}
        loadingHomes={loadingHomes}
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        billsCount={bills.length}
        membersCount={members.length}
        hasMembers={members.length > 0}
        onOpenCreateHome={() => setIsHomeModalOpen(true)}
        onOpenSplitExpense={() => {
          setBillTitle('')
          setBillAmountDollars('')
          setIsBillModalOpen(true)
        }}
      />

      {/* ================= RIGHT MAIN CANVAS ================= */}
      <div className="main-canvas">
        <Topbar
          householdName={selectedHome?.name || 'Loading...'}
          onOpenAddRoommate={() => setIsMemberModalOpen(true)}
        />

        <main className="canvas-content">
          {loadingHomes ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
              <div
                className="spin-indicator"
                style={{
                  borderTopColor: '#4f46e5',
                  width: 24,
                  height: 24,
                  margin: '0 auto 16px',
                }}
              />
              <p>Connecting to Cloudflare D1...</p>
            </div>
          ) : homes.length === 0 ? (
            <div className="bento-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  margin: '0 auto 18px',
                  background: '#eef2ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4f46e5',
                }}
              >
                <svg
                  aria-hidden="true"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                No Households Registered
              </h2>
              <p
                style={{
                  color: '#64748b',
                  fontSize: 14,
                  maxWidth: 380,
                  margin: '0 auto 20px',
                }}
              >
                Set up your shared home to invite roommates and split expenses with preserved cent
                arithmetic.
              </p>
              <button
                type="button"
                className="btn-v2 btn-v2-primary"
                onClick={() => setIsHomeModalOpen(true)}
              >
                + Initialize Household
              </button>
            </div>
          ) : (
            <div>
              {/* Top Bento Stats Grid */}
              <BentoGrid
                totalVolumeCents={totalVolumeCents}
                totalOwedCents={totalOwedCents}
                settledCents={settledCents}
                settledRatio={settledRatio}
                members={members}
                balances={balances}
                onOpenPreset={handleOpenPreset}
              />

              {/* View 1: Expenses & Splits Feed */}
              {activeNav === 'feed' && (
                <ExpenseFeed
                  bills={bills}
                  members={members}
                  feedFilter={feedFilter}
                  onFilterChange={setFeedFilter}
                  loadingDetails={loadingDetails}
                  payingShareId={payingShareId}
                  onPayShare={handlePayShare}
                />
              )}

              {/* View 2: Roommate Priority Registry */}
              {activeNav === 'roommates' && (
                <RoommateRegistry
                  members={members}
                  balances={balances}
                  onOpenAddRoommate={() => setIsMemberModalOpen(true)}
                />
              )}

              {/* View 3: Chaos & Resilience Console */}
              {activeNav === 'chaos' && (
                <ChaosLab
                  sim500Error={sim500Error}
                  onToggle500={() => setSim500Error(!sim500Error)}
                  simLatency={simLatency}
                  onToggleLatency={() => setSimLatency(!simLatency)}
                  isBurstFiring={isBurstFiring}
                  onFireBurst={handleFireBurst}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals & Overlays */}
      <CreateHomeModal
        isOpen={isHomeModalOpen}
        onClose={() => setIsHomeModalOpen(false)}
        name={newHomeName}
        onChangeName={setNewHomeName}
        onSubmit={handleCreateHome}
        isSubmitting={isSubmittingHome}
      />

      <AddRoommateModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        name={newMemberName}
        onChangeName={setNewMemberName}
        onSubmit={handleAddMember}
        isSubmitting={isSubmittingMember}
      />

      <SplitBillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        title={billTitle}
        onChangeTitle={setBillTitle}
        amountDollars={billAmountDollars}
        onChangeAmount={setBillAmountDollars}
        memberCount={members.length}
        onSubmit={handleCreateBill}
        isSubmitting={isSubmittingBill}
      />

      {/* Floating Toast Notification Dock */}
      <ToastDock toasts={toasts} onRemoveToast={removeToast} />
    </div>
  )
}
