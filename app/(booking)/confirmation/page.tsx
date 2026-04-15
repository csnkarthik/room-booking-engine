import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Download, Calendar, Users, Home } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { readBookingById } from '@/lib/utils/data'
import { formatCurrency, formatDisplayDate, daysBetween } from '@/lib/utils/dates'

interface PageProps {
  searchParams: Promise<{ bookingId?: string }>
}

export default async function ConfirmationPage({ searchParams }: PageProps) {
  const { bookingId } = await searchParams

  if (!bookingId) notFound()

  const booking = readBookingById(bookingId)
  if (!booking) notFound()

  const nights = daysBetween(booking.checkIn, booking.checkOut)

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
            A confirmation has been sent to{' '}
            <span className="font-medium text-slate-900">{booking.guest.email}</span>
          </p>
        </div>

        {/* Booking reference */}
        <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Booking Reference</h2>
            <Badge variant="outline" className="font-mono text-xs">
              {booking.id.slice(0, 8).toUpperCase()}
            </Badge>
          </div>

          {/* Room image */}
          {booking.room && (
            <div className="mb-4 flex gap-4">
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={booking.room.images[0]}
                  alt={booking.room.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
              <div>
                <p className="font-semibold">{booking.room.name}</p>
                <Badge variant="outline" className="mt-1 text-xs capitalize">
                  {booking.room.type}
                </Badge>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Calendar className="text-muted-foreground h-4 w-4 shrink-0" />
              <div className="flex-1">
                <span className="text-muted-foreground">Dates: </span>
                <span className="font-medium">
                  {formatDisplayDate(booking.checkIn)} → {formatDisplayDate(booking.checkOut)}
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
                  {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                </span>
              </span>
            </div>

            {/* Add-ons */}
            {(booking.extras.breakfast ||
              booking.extras.airportTransfer ||
              booking.extras.lateCheckout) && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {booking.extras.breakfast && (
                  <Badge variant="secondary" className="text-xs">
                    🍳 Breakfast
                  </Badge>
                )}
                {booking.extras.airportTransfer && (
                  <Badge variant="secondary" className="text-xs">
                    ✈️ Airport Transfer
                  </Badge>
                )}
                {booking.extras.lateCheckout && (
                  <Badge variant="secondary" className="text-xs">
                    ⏰ Late Checkout
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="mt-4 flex justify-between border-t pt-4 font-semibold">
            <span>Total Paid</span>
            <span className="text-primary">{formatCurrency(booking.totalPrice)}</span>
          </div>
        </div>

        {/* Guest details */}
        <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Guest Details</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">
                {booking.guest.firstName} {booking.guest.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{booking.guest.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium">{booking.guest.phone}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
              </dd>
            </div>
          </dl>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={`/api/bookings/${booking.id}/ical`}
            download
            className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 gap-2')}
          >
            <Download className="h-4 w-4" />
            Download to Calendar (.ics)
          </a>
          <Link href="/" className={cn(buttonVariants(), 'flex-1 gap-2')}>
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}
