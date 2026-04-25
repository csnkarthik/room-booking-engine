'use client'

import Image from 'next/image'
import { useBookingStore } from '@/lib/store/bookingStore'
import { formatCurrency, formatDisplayDate, daysBetween } from '@/lib/utils/dates'
import { Badge } from '@/components/ui/badge'

export function BookingSummary() {
  const { cartItems, extras } = useBookingStore()

  if (cartItems.length === 0) return null

  const roomsTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const totalNights = cartItems.reduce(
    (sum, item) => sum + daysBetween(item.checkIn, item.checkOut),
    0
  )
  const breakfastTotal = extras.breakfast ? 25 * totalNights : 0
  const transferTotal = extras.airportTransfer ? 75 : 0
  const lateCheckoutTotal = extras.lateCheckout ? 50 : 0
  const grandTotal = roomsTotal + breakfastTotal + transferTotal + lateCheckoutTotal

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        Booking Summary{' '}
        <span className="text-muted-foreground text-sm font-normal">
          ({cartItems.length} room{cartItems.length !== 1 ? 's' : ''})
        </span>
      </h2>

      <div className="space-y-5">
        {cartItems.map((item, index) => {
          const nights = daysBetween(item.checkIn, item.checkOut)
          const roomTotal = item.room.pricePerNight * nights

          return (
            <div key={index} className="rounded-xl bg-slate-50 p-4">
              {/* Room */}
              <div className="mb-3 flex gap-3">
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={item.room.images[0]}
                    alt={item.room.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.room.name}</p>
                  <Badge variant="outline" className="mt-1 text-xs capitalize">
                    {item.room.type}
                  </Badge>
                </div>
              </div>

              {/* Dates */}
              <div className="mb-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in</span>
                  <span className="font-medium">{formatDisplayDate(item.checkIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out</span>
                  <span className="font-medium">{formatDisplayDate(item.checkOut)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guests</span>
                  <span className="font-medium">
                    {item.guests} {item.guests === 1 ? 'guest' : 'guests'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">
                    {nights} {nights === 1 ? 'night' : 'nights'}
                  </span>
                </div>
              </div>

              {/* Room subtotal */}
              <div className="flex justify-between border-t pt-2 text-sm">
                <span className="text-muted-foreground">
                  {formatCurrency(item.room.pricePerNight)} × {nights} night{nights > 1 ? 's' : ''}
                </span>
                <span className="font-medium">{formatCurrency(roomTotal)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Extras */}
      {(extras.breakfast || extras.airportTransfer || extras.lateCheckout) && (
        <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 p-3 text-sm">
          <p className="text-muted-foreground text-xs font-semibold uppercase">Add-ons</p>
          {extras.breakfast && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Breakfast × {totalNights} nights</span>
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
        </div>
      )}

      {/* Grand total */}
      <div className="mt-4 flex justify-between border-t pt-4 text-base font-bold">
        <span>Total</span>
        <span className="text-primary">{formatCurrency(grandTotal)}</span>
      </div>

      <p className="text-muted-foreground mt-4 text-center text-xs">
        Powered by <span className="font-semibold text-[#635bff]">Stripe</span> — Test mode
      </p>
    </div>
  )
}
