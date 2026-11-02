export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return Number.isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
  } catch {
    return dateStr
  }
}
