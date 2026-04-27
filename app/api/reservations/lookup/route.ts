import { NextRequest, NextResponse } from 'next/server'
import { fetchHospitalityToken } from '@/lib/services/hospitalityToken'

function getEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing env var: ${key}`)
  return val
}

export async function POST(req: NextRequest) {
  try {
    const { confirmationNumber, lastName, arrivalDate } = await req.json()

    if (!confirmationNumber || !lastName || !arrivalDate) {
      return NextResponse.json(
        { error: 'confirmationNumber, lastName, and arrivalDate are required' },
        { status: 400 }
      )
    }

    const token = await fetchHospitalityToken()
    const baseUrl = getEnv('HOSPITALITY_API_BASE_URL')
    const hotelId = getEnv('HOSPITALITY_HOTEL_ID')

    const params = new URLSearchParams({
      confirmationId: confirmationNumber,
      lastName,
      startDate: arrivalDate,
      fetchInstructions: 'Reservation',
    })

    const url = `${baseUrl}/rsv/v1/hotels/${hotelId}/reservations?${params}`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-app-key': getEnv('HOSPITALITY_APP_KEY'),
        'x-hotelid': hotelId,
        'Content-Type': 'application/json',
      },
    })

    if (res.status === 404) {
      return NextResponse.json({ found: false }, { status: 200 })
    }

    if (!res.ok) {
      const text = await res.text()
      console.error('[/api/reservations/lookup] Opera error', res.status, text)
      return NextResponse.json({ found: false }, { status: 200 })
    }

    const data = await res.json()
    const reservations: Array<{ reservationIdList?: Array<{ id: string; type: string }> }> =
      data.reservations?.reservation ?? []

    if (reservations.length === 0) {
      return NextResponse.json({ found: false }, { status: 200 })
    }

    const first = reservations[0]
    const idList = first.reservationIdList ?? []
    const reservationId = idList.find((r) => r.type === 'Reservation')?.id

    if (!reservationId) {
      return NextResponse.json({ found: false }, { status: 200 })
    }

    return NextResponse.json({ found: true, reservationId })
  } catch (err) {
    console.error('[/api/reservations/lookup] error', err)
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }
}
