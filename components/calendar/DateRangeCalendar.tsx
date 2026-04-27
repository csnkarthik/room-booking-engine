'use client'

import { useState, useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDate, parseDate, daysBetween } from '@/lib/utils/dates'
import { getDailyPrice } from '@/lib/utils/pricing'
import type { DateRange, Availability } from '@/lib/types'

interface DateRangeCalendarProps {
  checkIn: string | null
  checkOut: string | null
  availability?: Availability
  /** Base price per night — static fallback when dailyPrices is absent */
  basePrice?: number
  /** API-driven per-day prices keyed by YYYY-MM-DD; takes precedence over basePrice */
  dailyPrices?: Record<string, number>
  onSelect: (checkIn: string, checkOut: string) => void
  onClose?: () => void
  /** Called when the user navigates to a different month */
  onMonthChange?: (year: number, month: number) => void
  className?: string
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function formatPrice(price: number): string {
  return price >= 1000 ? `$${(price / 1000).toFixed(1)}k` : `$${price}`
}

const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function DateRangeCalendar({
  checkIn,
  checkOut,
  availability,
  basePrice,
  dailyPrices,
  onSelect,
  onClose,
  onMonthChange,
  className,
}: DateRangeCalendarProps) {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [hoverDate, setHoverDate] = useState<string | null>(null)
  const [selecting, setSelecting] = useState<'checkIn' | 'checkOut'>('checkIn')
  const [tempCheckIn, setTempCheckIn] = useState<string | null>(checkIn)

  const blockedRanges = useMemo<DateRange[]>(
    () => availability?.blockedRanges ?? [],
    [availability?.blockedRanges]
  )
  const minStay = availability?.minStayNights ?? 1

  // Right (second) month
  const rightMonth = viewMonth === 11 ? 0 : viewMonth + 1
  const rightYear = viewMonth === 11 ? viewYear + 1 : viewYear

  // Navigation limits via absolute month count (year * 12 + month)
  const todayAbs = today.getFullYear() * 12 + today.getMonth()
  const viewAbs = viewYear * 12 + viewMonth
  const rightAbs = rightYear * 12 + rightMonth
  const limitAbs = todayAbs + 3 // right month must not exceed today + 3 months

  const canGoPrev = viewAbs > todayAbs
  const canGoNext = rightAbs < limitAbs

  const isBlocked = useCallback(
    (dateStr: string): boolean => {
      const date = parseDate(dateStr)
      if (date < today) return true
      return blockedRanges.some((range) => {
        const from = parseDate(range.from)
        const to = parseDate(range.to)
        return date >= from && date <= to
      })
    },
    [blockedRanges, today]
  )

  const isInRange = useCallback(
    (dateStr: string): boolean => {
      const start = tempCheckIn
      const end = selecting === 'checkOut' ? hoverDate : checkOut
      if (!start || !end) return false
      const date = parseDate(dateStr)
      const from = parseDate(start)
      const to = parseDate(end)
      if (from > to) return false
      return date > from && date < to
    },
    [tempCheckIn, checkOut, hoverDate, selecting]
  )

  const isCheckIn = (dateStr: string) => dateStr === tempCheckIn
  const isCheckOut = (dateStr: string) =>
    selecting === 'checkIn' ? dateStr === checkOut : dateStr === hoverDate && tempCheckIn !== null

  const handleDayClick = (dateStr: string) => {
    if (isBlocked(dateStr)) return

    if (selecting === 'checkIn') {
      setTempCheckIn(dateStr)
      setSelecting('checkOut')
    } else {
      if (!tempCheckIn) return
      if (parseDate(dateStr) <= parseDate(tempCheckIn)) {
        setTempCheckIn(dateStr)
        return
      }
      const nights = daysBetween(tempCheckIn, dateStr)
      if (nights < minStay) return
      onSelect(tempCheckIn, dateStr)
      setSelecting('checkIn')
      if (onClose) onClose()
    }
  }

  const prevMonth = () => {
    if (!canGoPrev) return
    const newMonth = viewMonth === 0 ? 11 : viewMonth - 1
    const newYear = viewMonth === 0 ? viewYear - 1 : viewYear
    setViewMonth(newMonth)
    setViewYear(newYear)
    onMonthChange?.(newYear, newMonth)
  }

  const nextMonth = () => {
    if (!canGoNext) return
    const newMonth = viewMonth === 11 ? 0 : viewMonth + 1
    const newYear = viewMonth === 11 ? viewYear + 1 : viewYear
    setViewMonth(newMonth)
    setViewYear(newYear)
    onMonthChange?.(newYear, newMonth)
  }

  const leftMonthName = new Date(viewYear, viewMonth).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })
  const rightMonthName = new Date(rightYear, rightMonth).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  const showPricing = basePrice !== undefined || dailyPrices !== undefined

  const renderMonthGrid = (year: number, month: number) => {
    const daysInM = getDaysInMonth(year, month)
    const firstDayM = getFirstDayOfMonth(year, month)
    const daysM = Array.from({ length: daysInM }, (_, i) =>
      formatDate(new Date(year, month, i + 1))
    )

    return (
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDayM }).map((_, i) => (
          <div key={`e-${year}-${month}-${i}`} />
        ))}
        {daysM.map((dateStr) => {
          const blocked = isBlocked(dateStr)
          const inRange = isInRange(dateStr)
          const isStart = isCheckIn(dateStr)
          const isEnd = isCheckOut(dateStr)
          const dayNum = new Date(dateStr + 'T00:00:00').getDate()
          const price = !blocked
            ? (dailyPrices?.[dateStr] ?? (basePrice ? getDailyPrice(basePrice, dateStr) : null))
            : null

          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(dateStr)}
              onMouseEnter={() => setHoverDate(dateStr)}
              onMouseLeave={() => setHoverDate(null)}
              disabled={blocked}
              aria-label={`${dateStr}${price ? `, $${price} per night` : ''}`}
              aria-pressed={isStart || isEnd}
              className={cn(
                'relative flex flex-col items-center justify-center py-1 text-xs transition-colors',
                showPricing ? 'h-12' : 'h-9',
                blocked && 'cursor-not-allowed opacity-30',
                !blocked && 'hover:bg-primary/10 cursor-pointer',
                inRange && 'bg-primary/10',
                (isStart || isEnd) &&
                  'bg-primary text-primary-foreground hover:bg-primary rounded-lg font-semibold'
              )}
            >
              <span className={cn('font-medium', showPricing ? 'text-xs' : 'text-sm')}>
                {dayNum}
              </span>
              {price !== null && (
                <span
                  className={cn(
                    'text-[9px] leading-none',
                    isStart || isEnd ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}
                >
                  {formatPrice(price)}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={cn('w-full rounded-xl border bg-white p-4 shadow-lg', className)}
      role="dialog"
      aria-label="Date range calendar"
    >
      {/* Prompt */}
      <div className="text-muted-foreground mb-3 text-center text-xs">
        {selecting === 'checkIn'
          ? 'Select check-in date'
          : `Select check-out (min ${minStay} night${minStay > 1 ? 's' : ''})`}
      </div>

      <div className="flex gap-6">
        {/* Left month */}
        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              disabled={!canGoPrev}
              aria-label="Previous month"
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold">{leftMonthName}</span>
            {/* Next button visible only on mobile (right month is hidden) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              disabled={!canGoNext}
              aria-label="Next month"
              className="h-8 w-8 lg:hidden"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="hidden h-8 w-8 lg:block" />
          </div>
          <div className="mb-1 grid grid-cols-7 text-center">
            {DAY_HEADERS.map((d, i) => (
              <div key={i} className="text-muted-foreground py-1 text-xs font-medium">
                {d}
              </div>
            ))}
          </div>
          {renderMonthGrid(viewYear, viewMonth)}
        </div>

        {/* Right month — desktop only */}
        <div className="hidden flex-1 flex-col lg:flex">
          <div className="mb-3 flex items-center justify-between">
            <div className="h-8 w-8" />
            <span className="text-sm font-semibold">{rightMonthName}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              disabled={!canGoNext}
              aria-label="Next month"
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="mb-1 grid grid-cols-7 text-center">
            {DAY_HEADERS.map((d, i) => (
              <div key={i} className="text-muted-foreground py-1 text-xs font-medium">
                {d}
              </div>
            ))}
          </div>
          {renderMonthGrid(rightYear, rightMonth)}
        </div>
      </div>

      {minStay > 1 && (
        <p className="text-muted-foreground mt-2 text-center text-xs">
          Minimum stay: {minStay} nights
        </p>
      )}
    </div>
  )
}
