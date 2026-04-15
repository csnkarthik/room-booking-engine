import pricingData from '@/lib/data/pricing.json'

interface PricingConfig {
  weekdayMultiplier: number
  fridayMultiplier: number
  saturdayMultiplier: number
  overrides: { date: string; multiplier: number }[]
}

const config = pricingData as PricingConfig

const overrideMap = new Map(config.overrides.map((o) => [o.date, o.multiplier]))

export function getDayMultiplier(dateStr: string): number {
  if (overrideMap.has(dateStr)) return overrideMap.get(dateStr)!
  const day = new Date(dateStr + 'T00:00:00').getDay() // 0=Sun,6=Sat
  if (day === 5) return config.fridayMultiplier
  if (day === 6) return config.saturdayMultiplier
  return config.weekdayMultiplier
}

export function getDailyPrice(basePrice: number, dateStr: string): number {
  return Math.round(basePrice * getDayMultiplier(dateStr))
}

/** Total price across a date range using per-night pricing */
export function calculateStayPrice(
  basePrice: number,
  checkIn: string,
  checkOut: string,
  extras: { breakfast: boolean; airportTransfer: boolean; lateCheckout: boolean }
): number {
  const start = new Date(checkIn + 'T00:00:00')
  const end = new Date(checkOut + 'T00:00:00')
  let total = 0
  const cur = new Date(start)
  let nights = 0
  while (cur < end) {
    const dateStr = cur.toISOString().split('T')[0]
    total += getDailyPrice(basePrice, dateStr)
    cur.setDate(cur.getDate() + 1)
    nights++
  }
  if (extras.breakfast) total += 25 * nights
  if (extras.airportTransfer) total += 75
  if (extras.lateCheckout) total += 50
  return Math.round(total * 100) / 100
}

/** Build a date→price map for calendar display */
export function buildPriceMap(
  basePrice: number,
  fromDate: Date,
  months: number = 3
): Map<string, number> {
  const map = new Map<string, number>()
  const end = new Date(fromDate)
  end.setMonth(end.getMonth() + months)
  const cur = new Date(fromDate)
  while (cur <= end) {
    const dateStr = cur.toISOString().split('T')[0]
    map.set(dateStr, getDailyPrice(basePrice, dateStr))
    cur.setDate(cur.getDate() + 1)
  }
  return map
}
