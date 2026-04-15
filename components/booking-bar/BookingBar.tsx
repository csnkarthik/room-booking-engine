'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DateRangeCalendar } from '@/components/calendar/DateRangeCalendar'
import { GuestSelector } from '@/components/booking-bar/GuestSelector'
import { useBookingStore } from '@/lib/store/bookingStore'
import { formatDisplayDate } from '@/lib/utils/dates'
import { cn } from '@/lib/utils'

interface BookingBarProps {
  className?: string
  /** Show per-day pricing in the calendar (e.g. minimum room price) */
  basePrice?: number
  /** If provided, called on Search instead of navigating to /rooms */
  onSearch?: () => void
}

export function BookingBar({ className, basePrice, onSearch }: BookingBarProps) {
  const router = useRouter()
  const { checkIn, checkOut, guests, setDates, setGuests } = useBookingStore()

  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

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
    router.push(`/rooms?${params.toString()}`)
  }

  const dateLabel =
    checkIn && checkOut
      ? `${formatDisplayDate(checkIn)} → ${formatDisplayDate(checkOut)}`
      : 'Check-in → Check-out'

  return (
    <div
      className={cn('w-full rounded-2xl border bg-white shadow-lg', className)}
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
            className="hover:bg-muted/50 flex h-full w-full items-center gap-2 px-4 py-3 focus:outline-none md:rounded-l-2xl"
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
                onSelect={(ci, co) => {
                  setDates(ci, co)
                  setShowCalendar(false)
                }}
                onClose={() => setShowCalendar(false)}
              />
            </div>
          )}
        </div>

        {/* Guests */}
        <div className="flex-1">
          <GuestSelector value={guests} onChange={setGuests} className="h-full" />
        </div>

        {/* Search CTA */}
        <div className="flex items-center p-2 md:rounded-r-2xl">
          <Button
            onClick={handleSearch}
            size="lg"
            className="w-full gap-2 md:w-auto"
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
