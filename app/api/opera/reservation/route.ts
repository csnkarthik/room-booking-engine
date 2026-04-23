import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createReservation } from '@/lib/services/operaReservation'

const CreateReservationSchema = z.object({
  roomId: z.string(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().int().min(1),
  totalPrice: z.number().positive(),
  guest: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    countryCode: z.string().length(2).default('US'),
  }),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = CreateReservationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { roomId, checkIn, checkOut, adults, totalPrice, guest } = parsed.data

    const result = await createReservation({
      checkIn,
      checkOut,
      adults,
      totalPrice,
      roomTypeCode: roomId,
      givenName: guest.firstName,
      surname: guest.lastName,
      emailAddress: guest.email,
      address: {
        addressLine1: guest.addressLine1,
        addressLine2: guest.addressLine2,
        city: guest.city,
        state: guest.state,
        postalCode: guest.postalCode,
        countryCode: guest.countryCode,
      },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    console.error('[/api/opera/reservation] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create Opera reservation' },
      { status: 500 }
    )
  }
}
