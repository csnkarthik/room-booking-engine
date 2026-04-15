import type { DateRange } from '@/lib/types'

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

export function daysBetween(from: string, to: string): number {
  const start = parseDate(from)
  const end = parseDate(to)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export function isDateInRange(date: Date, range: DateRange): boolean {
  const from = parseDate(range.from)
  const to = parseDate(range.to)
  return date >= from && date <= to
}

export function isDateBlocked(dateStr: string, blockedRanges: DateRange[]): boolean {
  const date = parseDate(dateStr)
  return blockedRanges.some((range) => isDateInRange(date, range))
}

export function calculateTotalPrice(
  pricePerNight: number,
  checkIn: string,
  checkOut: string,
  extras: { breakfast: boolean; airportTransfer: boolean; lateCheckout: boolean }
): number {
  const nights = daysBetween(checkIn, checkOut)
  let total = pricePerNight * nights
  if (extras.breakfast) total += 25 * nights
  if (extras.airportTransfer) total += 75
  if (extras.lateCheckout) total += 50
  return Math.round(total * 100) / 100
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatDisplayDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
