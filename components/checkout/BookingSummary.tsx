'use client'

import Image from 'next/image'
import { useBookingStore } from '@/lib/store/bookingStore'
import { formatCurrency, formatDisplayDate, daysBetween } from '@/lib/utils/dates'
import { Badge } from '@/components/ui/badge'

export function BookingSummary() {
  const { room, checkIn, checkOut, guests, extras, totalPrice } = useBookingStore()

  if (!room || !checkIn || !checkOut) return null

  const nights = daysBetween(checkIn, checkOut)
  const roomTotal = room.pricePerNight * nights
  const breakfastTotal = extras.breakfast ? 25 * nights : 0
  const transferTotal = extras.airportTransfer ? 75 : 0
  const lateCheckoutTotal = extras.lateCheckout ? 50 : 0

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Booking Summary</h2>

      {/* Room */}
      <div className="mb-4 flex gap-3">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
          <Image src={room.images[0]} alt={room.name} fill className="object-cover" sizes="112px" />
        </div>
        <div>
          <p className="font-medium">{room.name}</p>
          <Badge variant="outline" className="mt-1 text-xs capitalize">
            {room.type}
          </Badge>
        </div>
      </div>

      {/* Dates */}
      <div className="mb-4 space-y-1.5 rounded-xl bg-slate-50 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Check-in</span>
          <span className="font-medium">{formatDisplayDate(checkIn)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Check-out</span>
          <span className="font-medium">{formatDisplayDate(checkOut)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Guests</span>
          <span className="font-medium">
            {guests} {guests === 1 ? 'guest' : 'guests'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Duration</span>
          <span className="font-medium">
            {nights} {nights === 1 ? 'night' : 'nights'}
          </span>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {formatCurrency(room.pricePerNight)} × {nights} night{nights > 1 ? 's' : ''}
          </span>
          <span>{formatCurrency(roomTotal)}</span>
        </div>
        {extras.breakfast && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Breakfast × {nights} nights</span>
            <span>{formatCurrency(breakfastTotal)}</span>
          </div>
        )}
        {extras.airportTransfer && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Airport transfer</span>
            <span>{formatCurrency(transferTotal)}</span>
          </div>
        )}
        {extras.lateCheckout && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Late checkout</span>
            <span>{formatCurrency(lateCheckoutTotal)}</span>
          </div>
        )}

        <div className="flex justify-between border-t pt-2 font-semibold">
          <span>Total</span>
          <span className="text-primary">{formatCurrency(totalPrice || roomTotal)}</span>
        </div>
      </div>

      <p className="text-muted-foreground mt-4 text-center text-xs">
        Powered by <span className="font-semibold text-[#635bff]">Stripe</span> — Test mode
      </p>
    </div>
  )
}
