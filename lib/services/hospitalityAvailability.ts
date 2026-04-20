import { fetchHospitalityToken } from './hospitalityToken'

export interface AvailabilityParams {
  checkIn: string
  checkOut: string
  adults: number
  rooms?: number
}

/**
 * Returns a Map of roomType → pricePerNight (in USD) for all room types
 * that have numberOfUnits > 0 for the requested stay window.
 */
export async function getAvailableRoomTypes(
  params: AvailabilityParams
): Promise<Map<string, number>> {
  const token = await fetchHospitalityToken()
  const hotelId = process.env.HOSPITALITY_HOTEL_ID!
  const url = new URL(
    `${process.env.HOSPITALITY_API_BASE_URL}/par/v1/hotels/${hotelId}/availability`
  )

  url.searchParams.set('roomStayStartDate', params.checkIn)
  url.searchParams.set('roomStayEndDate', params.checkOut)
  url.searchParams.set('roomStayQuantity', String(params.rooms ?? 1))
  url.searchParams.set('adults', String(params.adults))
  url.searchParams.set('children', '0')
  url.searchParams.set('limit', '100')

  const res = await fetch(url.toString(), {
    headers: {
      'x-hotelid': hotelId,
      'x-app-key': process.env.HOSPITALITY_APP_KEY!,
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 300 },
  })

  if (!res.ok) throw new Error(`Availability fetch failed (${res.status}): ${await res.text()}`)

  const data = await res.json()
  const roomRates: Array<{
    roomType: string
    numberOfUnits: number
    rates?: { rate?: Array<{ base?: { amountBeforeTax?: number } }> }
  }> = data?.hotelAvailability?.[0]?.roomStays?.[0]?.roomRates ?? []

  const result = new Map<string, number>()
  for (const rate of roomRates) {
    if (rate.numberOfUnits > 0) {
      const pricePerNight = rate.rates?.rate?.[0]?.base?.amountBeforeTax ?? 0
      result.set(rate.roomType, pricePerNight)
    }
  }
  return result
}
