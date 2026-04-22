'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { DateRangeCalendar } from '@/components/calendar/DateRangeCalendar'
import { useCalendarPricing } from '@/lib/hooks/useCalendarPricing'
import type { Room } from '@/lib/types'

interface RoomCardCalendarProps {
  room: Room
  checkIn?: string | null
  checkOut?: string | null
  guests?: number
}

function monthBounds(year: number, month: number): { startDate: string; endDate: string } {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

export function RoomCardCalendar({ room, checkIn, checkOut, guests }: RoomCardCalendarProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const today = new Date()
  const [visibleYear, setVisibleYear] = useState(today.getFullYear())
  const [visibleMonth, setVisibleMonth] = useState(today.getMonth())

  const { startDate, endDate } = monthBounds(visibleYear, visibleMonth)
  const { dailyPrices } = useCalendarPricing(room.id, guests ?? 1, startDate, endDate)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleSelect = (ci: string, co: string) => {
    const params = new URLSearchParams()
    params.set('checkIn', ci)
    params.set('checkOut', co)
    if (guests) params.set('guests', String(guests))
    router.push(`/rooms/${room.id}?${params.toString()}`)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        aria-label="View pricing calendar"
        aria-expanded={open}
        className="hover:border-primary hover:text-primary flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition"
      >
        <Calendar className="h-3.5 w-3.5" />
        Prices
      </button>

      {open && (
        <div className="absolute right-0 bottom-full z-50 mb-2 w-72">
          <DateRangeCalendar
            checkIn={checkIn ?? null}
            checkOut={checkOut ?? null}
            dailyPrices={dailyPrices}
            onSelect={handleSelect}
            onClose={() => setOpen(false)}
            onMonthChange={(y, m) => {
              setVisibleYear(y)
              setVisibleMonth(m)
            }}
          />
        </div>
      )}
    </div>
  )
}
