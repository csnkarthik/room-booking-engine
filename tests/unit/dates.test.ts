import { describe, it, expect } from 'vitest'
import {
  formatDate,
  parseDate,
  daysBetween,
  isDateBlocked,
  calculateTotalPrice,
  formatCurrency,
  formatDisplayDate,
} from '@/lib/utils/dates'
import type { DateRange } from '@/lib/types'

describe('formatDate', () => {
  it('formats Date to YYYY-MM-DD', () => {
    const d = new Date(2026, 3, 15) // April 15, 2026
    expect(formatDate(d)).toBe('2026-04-15')
  })
})

describe('parseDate', () => {
  it('parses YYYY-MM-DD to Date without timezone issues', () => {
    const d = parseDate('2026-04-15')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(3)
    expect(d.getDate()).toBe(15)
  })
})

describe('daysBetween', () => {
  it('returns 0 for same date', () => {
    expect(daysBetween('2026-04-15', '2026-04-15')).toBe(0)
  })

  it('returns correct number of nights', () => {
    expect(daysBetween('2026-04-15', '2026-04-18')).toBe(3)
  })

  it('handles month boundaries', () => {
    expect(daysBetween('2026-04-28', '2026-05-03')).toBe(5)
  })
})

describe('isDateBlocked', () => {
  const ranges: DateRange[] = [
    { from: '2026-04-20', to: '2026-04-23' },
    { from: '2026-05-01', to: '2026-05-05' },
  ]

  it('returns true for date in blocked range', () => {
    expect(isDateBlocked('2026-04-21', ranges)).toBe(true)
  })

  it('returns true for date on range boundary', () => {
    expect(isDateBlocked('2026-04-20', ranges)).toBe(true)
    expect(isDateBlocked('2026-04-23', ranges)).toBe(true)
  })

  it('returns false for date outside all ranges', () => {
    expect(isDateBlocked('2026-04-19', ranges)).toBe(false)
    expect(isDateBlocked('2026-04-24', ranges)).toBe(false)
  })

  it('returns false for empty ranges', () => {
    expect(isDateBlocked('2026-04-21', [])).toBe(false)
  })
})

describe('calculateTotalPrice', () => {
  const noExtras = { breakfast: false, airportTransfer: false, lateCheckout: false }

  it('returns base price for 3 nights', () => {
    expect(calculateTotalPrice(100, '2026-04-15', '2026-04-18', noExtras)).toBe(300)
  })

  it('adds breakfast per night', () => {
    const extras = { ...noExtras, breakfast: true }
    expect(calculateTotalPrice(100, '2026-04-15', '2026-04-18', extras)).toBe(375) // 300 + 25*3
  })

  it('adds airport transfer as one-time', () => {
    const extras = { ...noExtras, airportTransfer: true }
    expect(calculateTotalPrice(100, '2026-04-15', '2026-04-18', extras)).toBe(375) // 300 + 75
  })

  it('adds late checkout as one-time', () => {
    const extras = { ...noExtras, lateCheckout: true }
    expect(calculateTotalPrice(100, '2026-04-15', '2026-04-18', extras)).toBe(350) // 300 + 50
  })

  it('combines all extras', () => {
    const extras = { breakfast: true, airportTransfer: true, lateCheckout: true }
    // 300 + 75 (breakfast 3x) + 75 (transfer) + 50 (late)
    expect(calculateTotalPrice(100, '2026-04-15', '2026-04-18', extras)).toBe(500)
  })
})

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(149)).toBe('$149.00')
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })
})

describe('formatDisplayDate', () => {
  it('returns a readable string', () => {
    const result = formatDisplayDate('2026-04-15')
    expect(result).toContain('2026')
    expect(result.length).toBeGreaterThan(5)
  })
})
