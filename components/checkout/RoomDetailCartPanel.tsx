'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DateRangeCalendar } from '@/components/calendar/DateRangeCalendar'
import { GuestSelector } from '@/components/booking-bar/GuestSelector'
import { useBookingStore } from '@/lib/store/bookingStore'
import { useCalendarPricing } from '@/lib/hooks/useCalendarPricing'
import { formatCurrency, formatDisplayDate, daysBetween } from '@/lib/utils/dates'
import { calculateStayPrice } from '@/lib/utils/pricing'
import type { Room, Availability, BookingExtras } from '@/lib/types'

function monthBounds(year: number, month: number): { startDate: string; endDate: string } {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

interface RoomDetailCartPanelProps {
  room: Room
  availability?: Availability
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: number
}

export function RoomDetailCartPanel({
  room,
  availability,
  initialCheckIn,
  initialCheckOut,
  initialGuests = 1,
}: RoomDetailCartPanelProps) {
  const router = useRouter()
  const { setDates, setGuests, addToCart, removeFromCart, updateCartItemExtras, cartItems } =
    useBookingStore()

  const [localCheckIn, setLocalCheckIn] = useState<string | null>(initialCheckIn ?? null)
  const [localCheckOut, setLocalCheckOut] = useState<string | null>(initialCheckOut ?? null)
  const [localGuests, setLocalGuests] = useState(initialGuests)
  const [showCalendar, setShowCalendar] = useState(false)

  const today = new Date()
  const [visibleYear, setVisibleYear] = useState(today.getFullYear())
  const [visibleMonth, setVisibleMonth] = useState(today.getMonth())
  const { startDate, endDate } = monthBounds(visibleYear, visibleMonth)
  const { dailyPrices } = useCalendarPricing(room.id, localGuests, startDate, endDate)

  useEffect(() => {
    if (initialCheckIn && initialCheckOut) {
      setDates(initialCheckIn, initialCheckOut)
    }
    setGuests(initialGuests)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateSelect = (ci: string, co: string) => {
    setLocalCheckIn(ci)
    setLocalCheckOut(co)
    setDates(ci, co)
    setShowCalendar(false)
  }

  const handleAddToCart = () => {
    if (!localCheckIn || !localCheckOut) {
      setShowCalendar(true)
      return
    }
    const noExtras = { breakfast: false, airportTransfer: false, lateCheckout: false }
    const totalPrice = calculateStayPrice(room.pricePerNight, localCheckIn, localCheckOut, noExtras)
    addToCart({
      room,
      checkIn: localCheckIn,
      checkOut: localCheckOut,
      guests: localGuests,
      extras: noExtras,
      totalPrice,
    })
  }

  const handleExtraToggle = (index: number, key: keyof BookingExtras) => {
    updateCartItemExtras(index, { [key]: !cartItems[index].extras[key] })
  }

  const nights = localCheckIn && localCheckOut ? daysBetween(localCheckIn, localCheckOut) : 0
  const noExtras = { breakfast: false, airportTransfer: false, lateCheckout: false }
  const estimatedPrice =
    localCheckIn && localCheckOut
      ? calculateStayPrice(room.pricePerNight, localCheckIn, localCheckOut, noExtras)
      : 0

  const grandTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0)

  return (
    <div className="overflow-y-auto rounded-2xl border border-[#E8D9C5] bg-white p-6 shadow-lg lg:max-h-[calc(100vh-8rem)]">
      {/* Price per night */}
      <div className="mb-4">
        <span className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[#3D2314]">
          {formatCurrency(room.pricePerNight)}
        </span>
        <span className="text-sm text-[#7B5135]"> / night</span>
      </div>

      {/* Date selection */}
      <div className="mb-3">
        <button
          onClick={() => setShowCalendar((o) => !o)}
          aria-expanded={showCalendar}
          className="w-full rounded-xl border border-[#E8D9C5] p-3 text-left transition-colors hover:border-[#3D2314] focus:ring-2 focus:ring-[#3D2314]/20 focus:outline-none"
        >
          <div className="grid grid-cols-2 divide-x divide-[#E8D9C5]">
            <div className="pr-3">
              <div className="text-xs font-semibold tracking-widest text-[#7B5135] uppercase">
                Check-in
              </div>
              <div className="text-sm font-medium text-[#3D2314]">
                {localCheckIn ? formatDisplayDate(localCheckIn) : 'Select date'}
              </div>
            </div>
            <div className="pl-3">
              <div className="text-xs font-semibold tracking-widest text-[#7B5135] uppercase">
                Check-out
              </div>
              <div className="text-sm font-medium text-[#3D2314]">
                {localCheckOut ? formatDisplayDate(localCheckOut) : 'Select date'}
              </div>
            </div>
          </div>
        </button>
        {showCalendar && (
          <div className="mt-2">
            <DateRangeCalendar
              checkIn={localCheckIn}
              checkOut={localCheckOut}
              availability={availability}
              dailyPrices={dailyPrices}
              basePrice={room.pricePerNight}
              onSelect={handleDateSelect}
              onClose={() => setShowCalendar(false)}
              onMonthChange={(y, m) => {
                setVisibleYear(y)
                setVisibleMonth(m)
              }}
            />
          </div>
        )}
      </div>

      {/* Guests */}
      <div className="mb-4 rounded-xl border border-[#E8D9C5]">
        <GuestSelector
          value={localGuests}
          max={room.maxGuests}
          onChange={(g) => {
            setLocalGuests(g)
            setGuests(g)
          }}
          className="h-full"
        />
      </div>

      {/* Price summary */}
      {nights > 0 && (
        <div className="mb-4 space-y-1 rounded-xl bg-[#FAF6F0] p-3 text-sm">
          <div className="flex justify-between text-[#7B5135]">
            <span>
              {formatCurrency(room.pricePerNight)} × {nights} night{nights > 1 ? 's' : ''}
            </span>
            <span className="font-medium text-[#3D2314]">{formatCurrency(estimatedPrice)}</span>
          </div>
          <div className="flex justify-between border-t border-[#E8D9C5] pt-1 font-semibold text-[#3D2314]">
            <span>Estimated total</span>
            <span>{formatCurrency(estimatedPrice)}</span>
          </div>
        </div>
      )}

      {/* Add to cart CTA */}
      <button
        onClick={handleAddToCart}
        className="w-full rounded-none bg-[#3D2314] py-3 text-xs font-semibold tracking-widest text-[#C8B89A] uppercase transition-opacity hover:opacity-90"
      >
        {!localCheckIn || !localCheckOut ? 'Select dates to add' : 'Add this room to cart'}
      </button>

      {/* Cart items */}
      {cartItems.length > 0 && (
        <>
          <hr className="my-6 border-[#E8D9C5]" />

          <h3 className="mb-4 text-xs font-semibold tracking-widest text-[#3D2314] uppercase">
            Your Selection ({cartItems.length} room{cartItems.length !== 1 ? 's' : ''})
          </h3>

          <div className="space-y-4">
            {cartItems.map((item, index) => {
              const itemNights = daysBetween(item.checkIn, item.checkOut)
              return (
                <div key={index} className="rounded-xl border border-[#E8D9C5] bg-[#FAF6F0] p-4">
                  {/* Room header */}
                  <div className="flex gap-3">
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={item.room.images[0]}
                        alt={item.room.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-[#3D2314]">{item.room.name}</p>
                        <button
                          onClick={() => removeFromCart(index)}
                          aria-label={`Remove ${item.room.name} from cart`}
                          className="shrink-0 text-[#C8B89A] transition-colors hover:text-[#3D2314]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-[#7B5135]">
                        {formatDisplayDate(item.checkIn)} → {formatDisplayDate(item.checkOut)}
                        {' · '}
                        {item.guests} guest{item.guests !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Add-ons */}
                  <div className="mt-3 space-y-2 border-t border-[#E8D9C5] pt-3">
                    <label className="flex cursor-pointer items-center justify-between text-xs text-[#7B5135]">
                      <span>🍳 Breakfast (+$25/night)</span>
                      <input
                        type="checkbox"
                        checked={item.extras.breakfast}
                        onChange={() => handleExtraToggle(index, 'breakfast')}
                        className="accent-[#3D2314]"
                      />
                    </label>
                    <label className="flex cursor-pointer items-center justify-between text-xs text-[#7B5135]">
                      <span>✈️ Airport transfer (+$75)</span>
                      <input
                        type="checkbox"
                        checked={item.extras.airportTransfer}
                        onChange={() => handleExtraToggle(index, 'airportTransfer')}
                        className="accent-[#3D2314]"
                      />
                    </label>
                    <label className="flex cursor-pointer items-center justify-between text-xs text-[#7B5135]">
                      <span>🕐 Late checkout (+$50)</span>
                      <input
                        type="checkbox"
                        checked={item.extras.lateCheckout}
                        onChange={() => handleExtraToggle(index, 'lateCheckout')}
                        className="accent-[#3D2314]"
                      />
                    </label>
                  </div>

                  {/* Item price */}
                  <div className="mt-3 flex items-center justify-between border-t border-[#E8D9C5] pt-3">
                    <span className="text-xs text-[#7B5135]">
                      {formatCurrency(item.room.pricePerNight)} × {itemNights} night
                      {itemNights !== 1 ? 's' : ''}
                    </span>
                    <span className="text-sm font-semibold text-[#3D2314]">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add another room */}
          <Link
            href="/rooms"
            className="mt-4 inline-flex items-center gap-1 text-xs text-[#7B5135] transition-colors hover:text-[#3D2314]"
          >
            <Plus className="h-3 w-3" />
            Add another room
          </Link>

          {/* Order summary */}
          <div className="mt-4 space-y-2 rounded-xl border border-[#E8D9C5] bg-white p-4 text-sm">
            <p className="text-xs font-semibold tracking-widest text-[#3D2314] uppercase">
              Order Summary
            </p>
            {cartItems.map((item, i) => {
              const n = daysBetween(item.checkIn, item.checkOut)
              return (
                <div key={i} className="flex justify-between text-[#7B5135]">
                  <span className="truncate pr-2">
                    {item.room.name} × {n}n
                  </span>
                  <span className="shrink-0 font-medium text-[#3D2314]">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
              )
            })}
            <div className="flex justify-between border-t border-[#E8D9C5] pt-2 font-bold text-[#3D2314]">
              <span>Grand Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Proceed to checkout */}
          <Button
            onClick={() => router.push('/checkout')}
            className="mt-4 w-full rounded-none bg-[#3D2314] text-xs tracking-widest text-[#C8B89A] uppercase hover:bg-[#3D2314]/90"
            size="lg"
          >
            Proceed to Checkout
          </Button>
          <p className="mt-2 text-center text-xs text-[#C8B89A]">You won&apos;t be charged yet</p>
        </>
      )}
    </div>
  )
}
