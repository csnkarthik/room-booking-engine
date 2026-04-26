'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Search, DoorOpen, Minus, Plus } from 'lucide-react'
import { DateRangeCalendar } from '@/components/calendar/DateRangeCalendar'
import { GuestSelector } from '@/components/booking-bar/GuestSelector'
import { useBookingStore } from '@/lib/store/bookingStore'
import { useCalendarPricing } from '@/lib/hooks/useCalendarPricing'
import { formatDisplayDate } from '@/lib/utils/dates'
import { cn } from '@/lib/utils'

interface BookingBarProps {
  className?: string
  /** Show per-day pricing in the calendar (e.g. minimum room price) */
  basePrice?: number
  /** Room type code (e.g. "BD") — enables API-driven per-day pricing */
  roomTypeCode?: string
  /** If provided, called on Search instead of navigating to /rooms */
  onSearch?: () => void
}

function monthBounds(year: number, month: number): { startDate: string; endDate: string } {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

const LABEL = 'text-[11px] font-black tracking-[1.5px] uppercase text-[#DDBE77]'
const VALUE = 'text-sm font-medium tracking-wide text-white'

export function BookingBar({ className, basePrice, roomTypeCode, onSearch }: BookingBarProps) {
  const router = useRouter()
  const { checkIn, checkOut, guests, rooms, setDates, setGuests, setRooms } = useBookingStore()

  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  const today = new Date()
  const [visibleYear, setVisibleYear] = useState(today.getFullYear())
  const [visibleMonth, setVisibleMonth] = useState(today.getMonth())
  const { startDate, endDate } = monthBounds(visibleYear, visibleMonth)
  const { dailyPrices } = useCalendarPricing(roomTypeCode, guests, startDate, endDate)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = () => {
    if (onSearch) {
      onSearch()
      return
    }
    const params = new URLSearchParams()
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    params.set('guests', String(guests))
    params.set('rooms', String(rooms))
    router.push(`/rooms?${params.toString()}`)
  }

  const checkInLabel = checkIn ? formatDisplayDate(checkIn) : 'Add Date'
  const checkOutLabel = checkOut ? formatDisplayDate(checkOut) : 'Add Date'

  return (
    <div className={cn('w-full bg-[#5D3F23]', className)} role="search" aria-label="Room search">
      <div className="flex flex-col divide-y divide-white/15 md:flex-row md:divide-x md:divide-y-0">
        {/* Check In / Check Out */}
        <div ref={calendarRef} className="relative flex-[2]">
          <button
            type="button"
            onClick={() => setShowCalendar((o) => !o)}
            aria-haspopup="dialog"
            aria-expanded={showCalendar}
            className="flex h-full w-full items-center gap-3 px-6 py-4 transition-colors hover:bg-white/5 focus:outline-none"
          >
            <Calendar className="h-4 w-4 shrink-0 text-[#DDBE77]" />
            <div className="flex gap-6 text-left">
              <div>
                <div className={LABEL}>Check In</div>
                <div className={cn(VALUE, !checkIn && 'text-white/50')}>{checkInLabel}</div>
              </div>
              <div>
                <div className={LABEL}>Check Out</div>
                <div className={cn(VALUE, !checkOut && 'text-white/50')}>{checkOutLabel}</div>
              </div>
            </div>
          </button>
          {showCalendar && (
            <div className="absolute top-full z-50 mt-2 w-80">
              <DateRangeCalendar
                checkIn={checkIn}
                checkOut={checkOut}
                basePrice={basePrice}
                dailyPrices={dailyPrices}
                onSelect={(ci, co) => {
                  setDates(ci, co)
                  setShowCalendar(false)
                }}
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
        <div className="flex-1">
          <GuestSelector value={guests} onChange={setGuests} className="h-full" />
        </div>

        {/* Rooms */}
        <div className="flex-1">
          <div className="flex h-full items-center gap-3 px-6 py-4">
            <DoorOpen className="h-4 w-4 shrink-0 text-[#DDBE77]" />
            <div className="flex-1">
              <div className={LABEL}>Rooms</div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRooms(Math.max(1, rooms - 1))}
                  disabled={rooms <= 1}
                  aria-label="Decrease rooms"
                  className="text-white/60 transition-colors hover:text-white disabled:opacity-30"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className={VALUE}>{rooms}</span>
                <button
                  type="button"
                  onClick={() => setRooms(Math.min(4, rooms + 1))}
                  disabled={rooms >= 4}
                  aria-label="Increase rooms"
                  className="text-white/60 transition-colors hover:text-white disabled:opacity-30"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search CTA */}
        <div className="flex items-center p-3">
          <button
            type="button"
            onClick={handleSearch}
            aria-label="Search available rooms"
            className="flex w-full items-center justify-center gap-2 bg-[#006F62] px-6 py-3 text-[11px] font-black tracking-[1.5px] text-white uppercase transition-colors hover:bg-[#008475] focus:outline-none md:w-auto"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>
        </div>
      </div>
    </div>
  )
}
