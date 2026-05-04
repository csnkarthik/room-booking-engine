'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, ArrowRight } from 'lucide-react'
import { DateRangeCalendar } from '@/components/calendar/DateRangeCalendar'
import { GuestSelector } from '@/components/booking-bar/GuestSelector'
import { useBookingStore } from '@/lib/store/bookingStore'
import { useCalendarPricing } from '@/lib/hooks/useCalendarPricing'
import { formatCurrency, formatDisplayDate, daysBetween } from '@/lib/utils/dates'
import { calculateStayPrice } from '@/lib/utils/pricing'
import type { Room, Availability } from '@/lib/types'

function isoDate(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

function monthBounds(year: number, month: number): { startDate: string; endDate: string } {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

interface CartPanelProps {
  room: Room
  availability?: Availability
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: number
}

const noExtras = { breakfast: false, airportTransfer: false, lateCheckout: false }

export function CartPanel({
  room,
  availability,
  initialCheckIn,
  initialCheckOut,
  initialGuests = 0,
}: CartPanelProps) {
  const router = useRouter()
  const {
    setDates,
    setGuests,
    addToCart,
    removeFromCart,
    cartItems,
    checkIn: storeCheckIn,
    checkOut: storeCheckOut,
    guests: storeGuests,
  } = useBookingStore()

  const defaultCI = initialCheckIn ?? storeCheckIn ?? isoDate(1)
  const defaultCO = initialCheckOut ?? storeCheckOut ?? isoDate(4)
  const defaultGuests = initialGuests > 1 ? initialGuests : storeGuests > 0 ? storeGuests : 1

  const [localCheckIn, setLocalCheckIn] = useState<string>(defaultCI)
  const [localCheckOut, setLocalCheckOut] = useState<string>(defaultCO)
  const [localGuests, setLocalGuests] = useState(defaultGuests)
  const [showCalendar, setShowCalendar] = useState(false)

  const today = new Date()
  const [visibleYear, setVisibleYear] = useState(today.getFullYear())
  const [visibleMonth, setVisibleMonth] = useState(today.getMonth())
  const { startDate, endDate } = monthBounds(visibleYear, visibleMonth)
  const { dailyPrices } = useCalendarPricing(room.id, localGuests, startDate, endDate)

  useEffect(() => {
    setDates(localCheckIn, localCheckOut)
    setGuests(localGuests)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateSelect = (ci: string, co: string) => {
    setLocalCheckIn(ci)
    setLocalCheckOut(co)
    setDates(ci, co)
    setShowCalendar(false)
  }

  const handleAddToCart = () => {
    const price = calculateStayPrice(room.pricePerNight, localCheckIn, localCheckOut, noExtras)
    addToCart({
      room,
      checkIn: localCheckIn,
      checkOut: localCheckOut,
      guests: localGuests,
      extras: noExtras,
      totalPrice: price,
    })
  }

  const nights = daysBetween(localCheckIn, localCheckOut)
  const estimatedPrice = calculateStayPrice(
    room.pricePerNight,
    localCheckIn,
    localCheckOut,
    noExtras
  )
  const grandTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0)

  return (
    <div className="overflow-hidden border border-[#D8D8D8] bg-white">
      {/* Header */}
      <div className="bg-[#5A3A27] px-5 py-4">
        <p className="text-[11px] font-black tracking-[2px] text-[#DDBE77] uppercase">Your Stay</p>
        <p className="mt-0.5 font-[family-name:var(--font-heading)] text-lg font-medium text-white">
          {room.name}
        </p>
      </div>

      <div className="p-5">
        {/* Date selector */}
        <button
          onClick={() => setShowCalendar((o) => !o)}
          aria-expanded={showCalendar}
          className="mb-3 w-full border border-[#D8D8D8] p-3 text-left transition-colors hover:border-[#006F62] focus:outline-none"
        >
          <div className="grid grid-cols-2 divide-x divide-[#D8D8D8]">
            <div className="pr-3">
              <div className="text-[10px] font-black tracking-[1.5px] text-[#8D8D8D] uppercase">
                Check-in
              </div>
              <div className="text-sm font-medium text-[#101010]">
                {formatDisplayDate(localCheckIn)}
              </div>
            </div>
            <div className="pl-3">
              <div className="text-[10px] font-black tracking-[1.5px] text-[#8D8D8D] uppercase">
                Check-out
              </div>
              <div className="text-sm font-medium text-[#101010]">
                {formatDisplayDate(localCheckOut)}
              </div>
            </div>
          </div>
        </button>

        {showCalendar && (
          <div className="mb-3">
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

        {/* Guest selector */}
        <div className="mb-4 border border-[#D8D8D8]">
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

        {/* Price preview */}
        {nights > 0 && (
          <div className="mb-4 border border-[#D8D8D8] bg-[#F8F5F0] p-3 text-sm">
            <div className="flex justify-between text-[#626262]">
              <span>
                {formatCurrency(room.pricePerNight)} × {nights} night{nights > 1 ? 's' : ''}
              </span>
              <span className="font-medium text-[#101010]">{formatCurrency(estimatedPrice)}</span>
            </div>
          </div>
        )}

        {/* Add to cart button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="mb-2 w-full bg-[#5A3A27] py-3 text-[11px] font-black tracking-[1.5px] text-white uppercase transition-colors hover:bg-[#4a2e1e]"
        >
          <span className="flex items-center justify-center gap-2">
            <Plus className="h-3.5 w-3.5" />
            Add to Cart
          </span>
        </button>

        <p className="mb-5 text-center text-[10px] tracking-wider text-[#8D8D8D]">
          You won&apos;t be charged yet
        </p>

        {/* Cart items */}
        {cartItems.length > 0 && (
          <>
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#D8D8D8]" />
              <span className="text-[10px] font-black tracking-[2px] text-[#8D8D8D] uppercase">
                In Your Cart
              </span>
              <div className="h-px flex-1 bg-[#D8D8D8]" />
            </div>

            <div className="mb-4 space-y-3">
              {cartItems.map((item, index) => {
                const itemNights = daysBetween(item.checkIn, item.checkOut)
                return (
                  <div key={index} className="border border-[#D8D8D8] p-3">
                    <div className="flex gap-3">
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden">
                        <Image
                          src={item.room.images[0]}
                          alt={item.room.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-sm leading-tight font-semibold text-[#101010]">
                            {item.room.name}
                          </p>
                          <button
                            onClick={() => removeFromCart(index)}
                            aria-label={`Remove ${item.room.name}`}
                            className="shrink-0 p-0.5 text-[#2B2B2B] transition-colors hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="mt-0.5 text-[10px] text-[#2B2B2B]">
                          {formatDisplayDate(item.checkIn)} — {formatDisplayDate(item.checkOut)}
                        </p>
                        <p className="text-[10px] text-[#8D8D8D]">
                          {item.guests} guest{item.guests !== 1 ? 's' : ''} · {itemNights} night
                          {itemNights !== 1 ? 's' : ''}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#006F62]">
                          {formatCurrency(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Order total */}
            <div className="mb-4 border border-[#D8D8D8] bg-[#F8F5F0] p-3">
              <div className="space-y-1.5 text-sm">
                {cartItems.map((item, index) => {
                  const itemNights = daysBetween(item.checkIn, item.checkOut)
                  return (
                    <div key={index} className="flex justify-between text-[#626262]">
                      <span className="truncate pr-2 text-xs">
                        {item.room.name} × {itemNights}n
                      </span>
                      <span className="shrink-0 text-xs font-medium text-[#101010]">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-[#D8D8D8] pt-2">
                <span className="text-[11px] font-black tracking-[1px] text-[#101010] uppercase">
                  Total
                </span>
                <span className="text-base font-bold text-[#006F62]">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Proceed to checkout */}
            <button
              type="button"
              onClick={() => router.push('/checkout')}
              className="mb-3 flex w-full items-center justify-center gap-2 bg-[#006F62] py-3.5 text-[11px] font-black tracking-[1.5px] text-white uppercase transition-colors hover:bg-[#008475]"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Add another room */}
        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 text-[10px] font-black tracking-[1.5px] text-[#006F62] uppercase transition-colors hover:text-[#008475]"
        >
          <Plus className="h-3 w-3" />
          {cartItems.length > 0 ? 'Add Another Room' : 'Browse All Rooms'}
        </Link>
      </div>
    </div>
  )
}
