'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DateRangeCalendar } from '@/components/calendar/DateRangeCalendar'
import { GuestSelector } from '@/components/booking-bar/GuestSelector'
import { useBookingStore } from '@/lib/store/bookingStore'
import { useCalendarPricing } from '@/lib/hooks/useCalendarPricing'
import { formatCurrency, formatDisplayDate, daysBetween } from '@/lib/utils/dates'
import { calculateStayPrice } from '@/lib/utils/pricing'
import type { Room, Availability } from '@/lib/types'

function monthBounds(year: number, month: number): { startDate: string; endDate: string } {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

interface RoomBookingPanelProps {
  room: Room
  availability?: Availability
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: number
}

export function RoomBookingPanel({
  room,
  availability,
  initialCheckIn,
  initialCheckOut,
  initialGuests = 1,
}: RoomBookingPanelProps) {
  const router = useRouter()
  const { setRoom, setDates, setGuests, checkIn, checkOut, guests, totalPrice } = useBookingStore()

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
  }, [])

  const handleDateSelect = (ci: string, co: string) => {
    setLocalCheckIn(ci)
    setLocalCheckOut(co)
    setDates(ci, co)
    setShowCalendar(false)
  }

  const handleBook = () => {
    if (!localCheckIn || !localCheckOut) {
      setShowCalendar(true)
      return
    }
    setRoom(room)
    setDates(localCheckIn, localCheckOut)
    setGuests(localGuests)
    router.push('/checkout')
  }

  const nights = localCheckIn && localCheckOut ? daysBetween(localCheckIn, localCheckOut) : 0

  const noExtras = { breakfast: false, airportTransfer: false, lateCheckout: false }
  const estimatedPrice =
    localCheckIn && localCheckOut
      ? calculateStayPrice(room.pricePerNight, localCheckIn, localCheckOut, noExtras)
      : 0

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-lg">
      <div className="mb-4">
        <span className="text-primary text-2xl font-bold">
          {formatCurrency(room.pricePerNight)}
        </span>
        <span className="text-muted-foreground text-sm"> / night</span>
      </div>

      {/* Date Selection */}
      <div className="mb-3">
        <button
          onClick={() => setShowCalendar((o) => !o)}
          aria-expanded={showCalendar}
          className="hover:border-primary focus:ring-primary w-full rounded-xl border p-3 text-left focus:ring-2 focus:outline-none"
        >
          <div className="grid grid-cols-2 divide-x">
            <div className="pr-3">
              <div className="text-muted-foreground text-xs font-semibold uppercase">Check-in</div>
              <div className="text-sm font-medium">
                {localCheckIn ? formatDisplayDate(localCheckIn) : 'Select date'}
              </div>
            </div>
            <div className="pl-3">
              <div className="text-muted-foreground text-xs font-semibold uppercase">Check-out</div>
              <div className="text-sm font-medium">
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
      <div className="mb-4 rounded-xl border">
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
        <div className="mb-4 space-y-1 rounded-xl bg-slate-50 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {formatCurrency(room.pricePerNight)} × {nights} night{nights > 1 ? 's' : ''}
            </span>
            <span className="font-medium">{formatCurrency(estimatedPrice)}</span>
          </div>
          <div className="flex justify-between border-t pt-1 font-semibold">
            <span>Estimated total</span>
            <span>{formatCurrency(estimatedPrice)}</span>
          </div>
        </div>
      )}

      <Button onClick={handleBook} className="w-full" size="lg">
        {!localCheckIn || !localCheckOut ? 'Select dates to book' : 'Book Now'}
      </Button>

      <p className="text-muted-foreground mt-3 text-center text-xs">
        You won&apos;t be charged yet
      </p>
    </div>
  )
}
