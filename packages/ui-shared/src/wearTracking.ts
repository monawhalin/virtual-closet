export function formatLastWorn(lastWornAt?: number): string {
  if (!lastWornAt) return 'Never worn'
  const days = Math.floor((Date.now() - lastWornAt) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Worn today'
  if (days === 1) return 'Worn yesterday'
  if (days < 7) return `Worn ${days} days ago`
  if (days < 30) return `Worn ${Math.floor(days / 7)} week${days >= 14 ? 's' : ''} ago`
  if (days < 365) return `Worn ${Math.floor(days / 30)} month${days >= 60 ? 's' : ''} ago`
  return `Worn over a year ago`
}
