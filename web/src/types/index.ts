export interface HomeItem {
  id: string
  name: string
  createdAt?: string
}

export interface MemberItem {
  id: string
  homeId: string
  name: string
}

export interface ShareItem {
  id: string
  memberId: string
  memberName?: string
  amountCents: number
  paidAt: string | null
}

export interface BillItem {
  id: string
  homeId: string
  title: string
  totalCents: number
  createdAt: string
  shares: ShareItem[]
}

export interface BalanceItem {
  memberId: string
  name: string
  outstandingCents: number
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  text: string
}
