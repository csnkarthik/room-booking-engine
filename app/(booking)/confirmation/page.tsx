import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Calendar, Users, Home, Hotel, BedDouble, Clock } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookingStepNav } from '@/components/booking/BookingStepNav'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDisplayDate, daysBetween } from '@/lib/utils/dates'
import { getReservation, GetReservationResult } from '@/lib/services/operaReservation'
import { readRooms } from '@/lib/utils/data'

interface PageProps {
  searchParams: Promise<{
    reservationIds?: string
    reservationId?: string
    paymentIntentId?: string
  }>
}

export default async function ConfirmationPage({ searchParams }: PageProps) {
  const { reservationIds, reservationId, paymentIntentId } = await searchParams

  const ids: string[] = reservationIds
    ? reservationIds.split(',').filter(Boolean)
    : reservationId
      ? [reservationId]
      : []

  if (ids.length === 0 && !paymentIntentId) notFound()

  const reservations: GetReservationResult[] = []
  for (const id of ids) {
    try {
      reservations.push(await getReservation(id))
    } catch (err) {
      console.error('[ConfirmationPage] Failed to fetch Opera reservation:', id, err)
    }
  }

  if (reservations.length === 0 && paymentIntentId) {
    return (
      <div className="min-h-screen bg-white">
        <BookingStepNav currentStep={3} />
        <main className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-12">
          <div className="mb-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h1 className="mb-2 text-3xl font-bold text-[#101010]">Payment Received!</h1>
            <p className="text-[#626262]">Our team will confirm your reservation shortly.</p>
          </div>
          <div className="mb-6 border border-[#D8D8D8] bg-white p-6">
            <h2 className="mb-2 text-lg font-semibold">Payment Reference</h2>
            <p className="font-mono text-sm text-[#626262]">{paymentIntentId}</p>
          </div>
          <Link href="/" className={cn(buttonVariants(), 'gap-2 bg-[#006F62] hover:bg-[#008475]')}>
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </main>
      </div>
    )
  }

  if (reservations.length === 0) notFound()

  // Look up room data from rooms.json — roomType from Opera equals room.id
  const allRooms = readRooms()
  const roomMap = Object.fromEntries(allRooms.map((r) => [r.id, r]))

  const grandTotal = reservations.reduce((sum, r) => sum + r.amountBeforeTax, 0)

  return (
    <div className="min-h-screen bg-white">
      <BookingStepNav currentStep={3} />

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-12">
        {/* Success header */}
        <div className="mb-8 flex items-center gap-4">
          <CheckCircle className="h-10 w-10 shrink-0 text-green-500" />
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-medium tracking-wide text-[#101010]">
              Booking Confirmed!
            </h1>
            <p className="mt-0.5 text-sm text-[#626262]">
              {reservations.length} room{reservations.length !== 1 ? 's' : ''} reserved
              successfully. A confirmation has been sent to your email.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Left column — per-reservation detail ── */}
          <div className="space-y-6 lg:col-span-2">
            {reservations.map((operaData, index) => {
              const nights = daysBetween(operaData.arrivalDate, operaData.departureDate)
              const room = roomMap[operaData.roomType]
              return (
                <div key={operaData.operaReservationId}>
                  {reservations.length > 1 && (
                    <p className="mb-3 text-[10px] font-black tracking-[2px] text-[#8D8D8D] uppercase">
                      Room {index + 1}
                    </p>
                  )}

                  {/* Opera confirmation number */}
                  <div className="mb-4 border border-amber-200 bg-amber-50 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Hotel className="h-4 w-4 text-amber-700" />
                      <span className="text-[10px] font-black tracking-[2px] text-amber-700 uppercase">
                        Hotel Confirmation
                      </span>
                    </div>
                    <p className="font-mono text-2xl font-bold tracking-widest break-all text-amber-900 sm:text-4xl">
                      {operaData.operaConfirmationNumber}
                    </p>
                    <p className="mt-1 text-xs text-amber-700">
                      Quote this number when contacting the hotel
                    </p>
                  </div>

                  {/* Booking details grid */}
                  <div className="border border-[#D8D8D8] bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-[10px] font-black tracking-[2px] text-[#8D8D8D] uppercase">
                        Booking Details
                      </h2>
                      <Badge variant="outline" className="font-mono text-xs">
                        {operaData.operaReservationId.slice(0, 8).toUpperCase()}
                      </Badge>
                    </div>
                    <div className="mb-4 h-px w-12 bg-[#006F62]" />

                    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4">
                      <div>
                        <dt className="mb-1 flex items-center gap-1.5 text-[10px] font-black tracking-[1.5px] text-[#8D8D8D] uppercase">
                          <Calendar className="h-3 w-3" /> Check-in
                        </dt>
                        <dd className="font-semibold text-[#101010]">
                          {formatDisplayDate(operaData.arrivalDate)}
                        </dd>
                      </div>
                      <div>
                        <dt className="mb-1 flex items-center gap-1.5 text-[10px] font-black tracking-[1.5px] text-[#8D8D8D] uppercase">
                          <Calendar className="h-3 w-3" /> Check-out
                        </dt>
                        <dd className="font-semibold text-[#101010]">
                          {formatDisplayDate(operaData.departureDate)}
                        </dd>
                      </div>
                      <div>
                        <dt className="mb-1 flex items-center gap-1.5 text-[10px] font-black tracking-[1.5px] text-[#8D8D8D] uppercase">
                          <Clock className="h-3 w-3" /> Duration
                        </dt>
                        <dd className="font-semibold text-[#101010]">
                          {nights} night{nights !== 1 ? 's' : ''}
                        </dd>
                      </div>
                      <div>
                        <dt className="mb-1 flex items-center gap-1.5 text-[10px] font-black tracking-[1.5px] text-[#8D8D8D] uppercase">
                          <Users className="h-3 w-3" /> Guests
                        </dt>
                        <dd className="font-semibold text-[#101010]">
                          {operaData.adults} {operaData.adults === 1 ? 'guest' : 'guests'}
                        </dd>
                      </div>
                      <div>
                        <dt className="mb-1 flex items-center gap-1.5 text-[10px] font-black tracking-[1.5px] text-[#8D8D8D] uppercase">
                          <BedDouble className="h-3 w-3" /> Room Type
                        </dt>
                        <dd className="font-semibold text-[#101010]">
                          {room?.name ?? operaData.roomType}
                        </dd>
                      </div>
                      <div>
                        <dt className="mb-1 text-[10px] font-black tracking-[1.5px] text-[#8D8D8D] uppercase">
                          Guest Name
                        </dt>
                        <dd className="font-semibold text-[#101010]">{operaData.guestName}</dd>
                      </div>
                      <div>
                        <dt className="mb-1 text-[10px] font-black tracking-[1.5px] text-[#8D8D8D] uppercase">
                          Status
                        </dt>
                        <dd>
                          <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                        </dd>
                      </div>
                      <div>
                        <dt className="mb-1 text-[10px] font-black tracking-[1.5px] text-[#8D8D8D] uppercase">
                          Amount
                        </dt>
                        <dd className="font-semibold text-[#006F62]">
                          {formatCurrency(operaData.amountBeforeTax)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )
            })}

            {/* Actions */}
            <Link
              href="/"
              className={cn(buttonVariants(), 'inline-flex gap-2 bg-[#006F62] hover:bg-[#008475]')}
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          {/* ── Right column — order summary ── */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden border border-[#D8D8D8] bg-white lg:sticky lg:top-20">
              {/* Header */}
              <div className="bg-[#5A3A27] px-5 py-4">
                <p className="text-[11px] font-black tracking-[2px] text-[#DDBE77] uppercase">
                  Order Summary
                </p>
                <p className="mt-0.5 font-[family-name:var(--font-heading)] text-lg font-medium text-white">
                  {reservations.length} room{reservations.length !== 1 ? 's' : ''} confirmed
                </p>
              </div>

              <div className="p-5">
                {/* Per-reservation rows */}
                <div className="mb-4 space-y-3">
                  {reservations.map((r, index) => {
                    const room = roomMap[r.roomType]
                    const nights = daysBetween(r.arrivalDate, r.departureDate)
                    return (
                      <div key={index} className="border border-[#D8D8D8] p-3">
                        <div className="flex gap-3">
                          {/* Room image from rooms.json */}
                          <div className="relative h-16 w-20 shrink-0 overflow-hidden">
                            {room ? (
                              <Image
                                src={room.images[0]}
                                alt={room.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            ) : (
                              <div className="h-full w-full bg-[#F8F5F0]" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs leading-tight font-semibold text-[#101010]">
                              {room?.name ?? r.roomType}
                            </p>
                            <p className="mt-0.5 text-[10px] text-[#8D8D8D]">
                              {formatDisplayDate(r.arrivalDate)} —{' '}
                              {formatDisplayDate(r.departureDate)}
                            </p>
                            <p className="text-[10px] text-[#8D8D8D]">
                              {r.adults} guest{r.adults !== 1 ? 's' : ''} · {nights} night
                              {nights !== 1 ? 's' : ''}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-[#006F62]">
                              {formatCurrency(r.amountBeforeTax)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Total */}
                <div className="border border-[#D8D8D8] bg-[#F8F5F0] p-3">
                  <div className="space-y-2">
                    {reservations.map((r, i) => (
                      <div key={i} className="flex justify-between text-[#626262]">
                        <span className="truncate pr-2 text-xs">
                          {roomMap[r.roomType]?.name ?? r.roomType} ×{' '}
                          {daysBetween(r.arrivalDate, r.departureDate)}n
                        </span>
                        <span className="shrink-0 text-xs font-medium text-[#101010]">
                          {formatCurrency(r.amountBeforeTax)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-[#D8D8D8] pt-2">
                    <span className="text-[11px] font-black tracking-[1px] text-[#101010] uppercase">
                      Total Paid
                    </span>
                    <span className="text-base font-bold text-[#006F62]">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-center text-[10px] tracking-wide text-[#8D8D8D] italic">
                  Excludes applicable taxes and resort fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
