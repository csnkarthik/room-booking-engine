import { fetchHospitalityToken } from './hospitalityToken'
import type { DailyPrice } from '@/lib/types'

interface RateAmounts {
  onePersonRate?: number
  twoPersonRate?: number
  threePersonRate?: number
  fourPersonRate?: number
  fivePersonRate?: number
}

interface RatePlanScheduleDetail {
  rateAmounts: RateAmounts
  start: string
  end: string
  roomTypeList: string[]
}

interface RatePlanSchedule {
  ratePlanScheduleDetail: RatePlanScheduleDetail
}

interface RatePlanScheduleListResponse {
  ratePlanScheduleList: {
    ratePlanSchedule: RatePlanSchedule[]
    hasMore: boolean
  }
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function expandDateRange(start: string, end: string): string[] {
  const dates: string[] = []
  let current = start
  while (current <= end) {
    dates.push(current)
    current = addDays(current, 1)
  }
  return dates
}

export function pickRateForGuests(rates: DailyPrice['rates'], guests: number): number {
  const ordered = [rates.one, rates.two, rates.three, rates.four, rates.five]
  return ordered[Math.min(guests, ordered.length) - 1] ?? ordered.at(-1)!
}

export async function fetchCalendarPricing(
  startDate: string,
  endDate: string
): Promise<DailyPrice[]> {
  const token = await fetchHospitalityToken()
  const hotelId = process.env.HOSPITALITY_HOTEL_ID!
  const ratePlanCode = process.env.HOSPITALITY_RATE_PLAN_CODE!
  const baseUrl = `${process.env.HOSPITALITY_API_BASE_URL}/rtp/v1/hotels/${hotelId}/ratePlans/${ratePlanCode}/schedules`

  const headers = {
    Authorization: `Bearer ${token}`,
    'x-app-key': process.env.HOSPITALITY_APP_KEY!,
    'x-hotelid': hotelId,
    'x-enterpriseid': process.env.HOSPITALITY_ENTERPRISE_ID!,
  }

  const allSchedules: RatePlanSchedule[] = []
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const url = new URL(baseUrl)
    url.searchParams.set('startDate', startDate)
    url.searchParams.set('endDate', endDate)
    if (offset > 0) url.searchParams.set('offset', String(offset))

    const res = await fetch(url.toString(), {
      headers,
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      throw new Error(`Calendar pricing fetch failed (${res.status}): ${await res.text()}`)
    }

    const data = (await res.json()) as RatePlanScheduleListResponse
    const schedules = data.ratePlanScheduleList.ratePlanSchedule ?? []
    allSchedules.push(...schedules)
    hasMore = data.ratePlanScheduleList.hasMore
    offset += schedules.length
  }

  const dailyPrices: DailyPrice[] = []

  for (const schedule of allSchedules) {
    const { start, end, rateAmounts, roomTypeList } = schedule.ratePlanScheduleDetail
    const dates = expandDateRange(start, end)
    const rates: DailyPrice['rates'] = {
      one: rateAmounts.onePersonRate ?? 0,
      two: rateAmounts.twoPersonRate ?? rateAmounts.onePersonRate ?? 0,
      three:
        rateAmounts.threePersonRate ?? rateAmounts.twoPersonRate ?? rateAmounts.onePersonRate ?? 0,
      four:
        rateAmounts.fourPersonRate ?? rateAmounts.threePersonRate ?? rateAmounts.onePersonRate ?? 0,
      five:
        rateAmounts.fivePersonRate ?? rateAmounts.fourPersonRate ?? rateAmounts.onePersonRate ?? 0,
    }

    for (const date of dates) {
      dailyPrices.push({ date, rates, roomTypes: roomTypeList })
    }
  }

  return dailyPrices
}
