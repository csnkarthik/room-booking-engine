import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Calendar, Users, Home, Hotel } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDisplayDate, daysBetween } from '@/lib/utils/dates'
import { getReservation, GetReservationResult } from '@/lib/services/operaReservation'

interface PageProps {
  searchParams: Promise<{
    reservationIds?: string // comma-separated list (multi-room)
    reservationId?: string // legacy single-room
    paymentIntentId?: string
  }>
}

export default async function ConfirmationPage({ searchParams }: PageProps) {
  const { reservationIds, reservationId, paymentIntentId } = await searchParams

  // Normalise: support both ?reservationIds=A,B and legacy ?reservationId=A
  const ids: string[] = reservationIds
    ? reservationIds.split(',').filter(Boolean)
    : reservationId
      ? [reservationId]
      : []

  if (ids.length === 0 && !paymentIntentId) notFound()

  // Fetch all Opera reservations (best-effort — individual failures are tolerated)
  const reservations: GetReservationResult[] = []
  for (const id of ids) {
    try {
      const data = await getReservation(id)
      reservations.push(data)
    } catch (err) {
      console.error('[ConfirmationPage] Failed to fetch Opera reservation:', id, err)
    }
  }

  // Fallback: payment succeeded but no Opera data available
  if (reservations.length === 0 && paymentIntentId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-2xl px-4 py-12">
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900">Payment Received!</h1>
            <p className="text-muted-foreground">Our team will confirm your reservation shortly.</p>
          </div>
          <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">Payment Reference</h2>
            <p className="font-mono text-sm text-slate-600">{paymentIntentId}</p>
          </div>
          <Link href="/" className={cn(buttonVariants(), 'flex gap-2')}>
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </main>
      </div>
    )
  }

  if (reservations.length === 0) notFound()

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-2xl px-4 py-12">
        {/* Success header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Booking Confirmed!</h1>
          <p className="text-muted-foreground">
            {reservations.length} room{reservations.length !== 1 ? 's' : ''} reserved successfully.
          </p>
        </div>

        {/* One card per reservation */}
        {reservations.map((operaData, index) => {
          const nights = daysBetween(operaData.arrivalDate, operaData.departureDate)
          return (
            <div key={operaData.operaReservationId} className="mb-6">
              {reservations.length > 1 && (
                <p className="mb-2 text-sm font-semibold tracking-wider text-slate-500 uppercase">
                  Room {index + 1}
                </p>
              )}

              {/* Opera Confirmation */}
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Hotel className="h-5 w-5 text-amber-700" />
                  <h2 className="text-lg font-semibold text-amber-900">Hotel Confirmation</h2>
                </div>
                <div className="mb-3">
                  <p className="text-xs font-medium tracking-wider text-amber-700 uppercase">
                    Confirmation Number
                  </p>
                  <p className="mt-0.5 font-mono text-3xl font-bold text-amber-900">
                    {operaData.operaConfirmationNumber}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Quote this number when contacting the hotel
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-3 border-t border-amber-200 pt-3 text-sm">
                  <div>
                    <dt className="text-amber-700">Reservation ID</dt>
                    <dd className="font-mono font-medium">{operaData.operaReservationId}</dd>
                  </div>
                  <div>
                    <dt className="text-amber-700">Room Type</dt>
                    <dd className="font-medium">{operaData.roomType}</dd>
                  </div>
                  <div>
                    <dt className="text-amber-700">Arrival</dt>
                    <dd className="font-medium">{formatDisplayDate(operaData.arrivalDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-amber-700">Departure</dt>
                    <dd className="font-medium">{formatDisplayDate(operaData.departureDate)}</dd>
                  </div>
                </dl>
              </div>

              {/* Booking reference */}
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Booking Reference</h2>
                  <Badge variant="outline" className="font-mono text-xs">
                    {operaData.operaReservationId.slice(0, 8).toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-muted-foreground h-4 w-4 shrink-0" />
                    <div className="flex-1">
                      <span className="text-muted-foreground">Dates: </span>
                      <span className="font-medium">
                        {formatDisplayDate(operaData.arrivalDate)} →{' '}
                        {formatDisplayDate(operaData.departureDate)}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        ({nights} night{nights > 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="text-muted-foreground h-4 w-4 shrink-0" />
                    <span>
                      <span className="text-muted-foreground">Guests: </span>
                      <span className="font-medium">
                        {operaData.adults} {operaData.adults === 1 ? 'guest' : 'guests'}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between border-t pt-4 font-semibold">
                  <span>Total Paid</span>
                  <span className="text-primary">{formatCurrency(operaData.amountBeforeTax)}</span>
                </div>
              </div>

              {/* Guest details */}
              <div className="mt-4 rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="mb-3 text-lg font-semibold">Guest Details</h2>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Name</dt>
                    <dd className="font-medium">{operaData.guestName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )
        })}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/" className={cn(buttonVariants(), 'flex-1 gap-2')}>
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}
