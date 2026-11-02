export interface MemberRef {
  id: string
}

export interface GeneratedShare {
  id: string
  memberId: string
  amountCents: number
  paidAt: null
}

/**
 * Distributes an integer cent amount across members evenly.
 * Any remainder pennies from an uneven split are awarded one-by-one
 * to members in their true insertion order (index 0, 1, 2...).
 *
 * Guarantees mathematical conservation of money:
 * sum(shares.map(s => s.amountCents)) === totalCents
 */
export function calculateShares(totalCents: number, members: MemberRef[]): GeneratedShare[] {
  const count = members.length
  if (count === 0) return []

  const baseShare = Math.floor(totalCents / count)
  const remainder = totalCents % count

  const shares: GeneratedShare[] = []
  for (let i = 0; i < count; i++) {
    const member = members[i]
    if (!member) continue

    const extra = i < remainder ? 1 : 0
    shares.push({
      id: crypto.randomUUID(),
      memberId: member.id,
      amountCents: baseShare + extra,
      paidAt: null,
    })
  }

  return shares
}
