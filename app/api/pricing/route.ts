import { NextRequest, NextResponse } from 'next/server'
import { fetchCalendarPricing, pickRateForGuests } from '@/lib/services/calendarPricing'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const today = new Date().toISOString().slice(0, 10)
  const oneMonthOut = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const startDate = searchParams.get('startDate') ?? today
  const endDate = searchParams.get('endDate') ?? oneMonthOut
  const roomTypeCode = searchParams.get('roomTypeCode') ?? null
  const guests = Math.max(1, Math.min(5, Number(searchParams.get('guests') ?? '1')))

  try {
    const allPrices = await fetchCalendarPricing(startDate, endDate)

    const filtered = roomTypeCode
      ? allPrices.filter((p) => p.roomTypes.includes(roomTypeCode))
      : allPrices

    // When multiple entries share the same date (e.g. no roomTypeCode filter),
    // keep the minimum — gives a "starting from" price for the generic booking bar.
    const prices: Record<string, number> = {}
    for (const entry of filtered) {
      const rate = pickRateForGuests(entry.rates, guests)
      if (prices[entry.date] === undefined || rate < prices[entry.date]) {
        prices[entry.date] = rate
      }
    }

    return NextResponse.json({ prices })
  } catch (err) {
    console.error('[api/pricing]', err)
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 502 })
  }
}
