import { NextResponse } from 'next/server'
import { readBookingById } from '@/lib/utils/data'
import { generateICalContent } from '@/lib/utils/ical'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const booking = readBookingById(id)
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const ical = generateICalContent(booking)

    return new NextResponse(ical, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="luxstay-booking-${id}.ics"`,
      },
    })
  } catch (err) {
    console.error('[/api/bookings/[id]/ical] GET error:', err)
    return NextResponse.json({ error: 'Failed to generate iCal' }, { status: 500 })
  }
}
