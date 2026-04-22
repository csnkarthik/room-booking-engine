'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Search, DoorOpen, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

  const dateLabel =
    checkIn && checkOut
      ? `${formatDisplayDate(checkIn)} → ${formatDisplayDate(checkOut)}`
      : 'Check-in → Check-out'

  return (
    <div
      className={cn('w-full border border-[#E8D9C5] bg-white shadow-lg', className)}
      role="search"
      aria-label="Room search"
    >
      <div className="flex flex-col divide-y md:flex-row md:divide-x md:divide-y-0">
        {/* Dates */}
        <div ref={calendarRef} className="relative flex-[2]">
          <button
            type="button"
            onClick={() => setShowCalendar((o) => !o)}
            aria-haspopup="dialog"
            aria-expanded={showCalendar}
            className="hover:bg-muted/50 flex h-full w-full items-center gap-2 px-4 py-3 focus:outline-none"
          >
            <Calendar className="text-muted-foreground h-4 w-4 shrink-0" />
            <div className="text-left">
              <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Dates
              </div>
              <div className={cn('text-sm font-medium', !checkIn && 'text-muted-foreground')}>
                {dateLabel}
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
          <div className="flex h-full items-center gap-2 px-3 py-2">
            <DoorOpen className="text-muted-foreground h-4 w-4 shrink-0" />
            <div className="flex-1">
              <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Rooms
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRooms(Math.max(1, rooms - 1))}
                  disabled={rooms <= 1}
                  aria-label="Decrease rooms"
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-sm font-medium">
                  {rooms} {rooms === 1 ? 'room' : 'rooms'}
                </span>
                <button
                  type="button"
                  onClick={() => setRooms(Math.min(4, rooms + 1))}
                  disabled={rooms >= 4}
                  aria-label="Increase rooms"
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search CTA */}
        <div className="flex items-center p-2">
          <Button
            onClick={handleSearch}
            size="lg"
            className="w-full gap-2 rounded-none text-xs tracking-widest uppercase md:w-auto"
            aria-label="Search available rooms"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
