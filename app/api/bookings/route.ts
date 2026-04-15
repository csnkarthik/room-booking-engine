import { NextRequest, NextResponse } from 'next/server'
import { readBookings, writeBooking } from '@/lib/utils/data'
import { CreateBookingSchema } from '@/lib/types/schemas'

export async function GET() {
  try {
    const bookings = readBookings()
    return NextResponse.json(bookings)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = CreateBookingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const booking = writeBooking(parsed.data)
    return NextResponse.json(booking, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
