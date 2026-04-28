'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronDown, ChevronUp, X } from 'lucide-react'
import { DateRangeCalendar } from '@/components/calendar/DateRangeCalendar'
import { useBookingStore } from '@/lib/store/bookingStore'
import { useCalendarPricing } from '@/lib/hooks/useCalendarPricing'
import { daysBetween } from '@/lib/utils/dates'
import { cn } from '@/lib/utils'

interface BookingBarProps {
  className?: string
  basePrice?: number
  roomTypeCode?: string
  onSearch?: () => void
}

function monthBounds(year: number, month: number): { startDate: string; endDate: string } {
  const start = new Date(year, month, 1)
  // Covers both visible months in the two-month calendar view
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year
  const end = new Date(nextYear, nextMonth + 1, 0)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${m}/${d}/${y}`
}

function fmtLong(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

const LABEL = 'text-[13px] font-semibold uppercase tracking-wide text-[#626262] leading-none'
const VALUE = 'text-[15px] font-light text-[#626262] leading-none'
const DIVIDER = 'hidden lg:block w-px self-stretch bg-[#D8D8D8] mx-1 shrink-0'

function CircleBtn({
  icon,
  onClick,
  disabled,
  label,
}: {
  icon: '+' | '-'
  onClick: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-[36px] w-[36px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-black text-[14px] leading-none text-black transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {icon}
    </button>
  )
}

export function BookingBar({ className, basePrice, roomTypeCode, onSearch }: BookingBarProps) {
  const router = useRouter()
  const { checkIn, checkOut, guests, rooms, setDates, setGuests, setRooms } = useBookingStore()
  const resetDates = () =>
    useBookingStore.setState({ checkIn: null, checkOut: null, totalPrice: 0 })

  const [showCalendar, setShowCalendar] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetCalendar, setSheetCalendar] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)
  const [promoCode, setPromoCode] = useState('')

  const today = new Date()
  const [visibleYear, setVisibleYear] = useState(today.getFullYear())
  const [visibleMonth, setVisibleMonth] = useState(today.getMonth())
  const { startDate, endDate } = monthBounds(visibleYear, visibleMonth)
  const { dailyPrices } = useCalendarPricing(roomTypeCode, guests, startDate, endDate)

  const nights = checkIn && checkOut ? daysBetween(checkIn, checkOut) : null

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sheetOpen])

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

  const handleReset = () => {
    resetDates()
    setRooms(1)
    setGuests(1)
    setSheetCalendar(false)
  }

  const closeSheet = () => {
    setSheetOpen(false)
    setSheetCalendar(false)
  }

  const pillLabel =
    checkIn && checkOut ? `${fmtDate(checkIn)} – ${fmtDate(checkOut)}` : 'Select Dates'

  return (
    <>
      <div
        className={cn('w-full border-b border-[#D8D8D8] bg-white', className)}
        role="search"
        aria-label="Room search"
      >
        {/* ── MOBILE: collapsed pill ─────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://wynncdn.shrglobal.com/CrsMedia/P13764/bbe/encore-animated-logo-wynn-resort-212-once.png"
            alt="Encore Boston Harbor"
            className="h-9 w-auto object-contain"
          />
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#006F62] px-3 py-1.5 text-[13px] font-semibold text-[#006F62]"
          >
            {pillLabel}
            {sheetOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* ── DESKTOP: full horizontal bar ──────────────────────────── */}
        <div className="hidden gap-0 px-5 lg:flex lg:h-[94px] lg:items-center">
          {/* Logo */}
          <div className="flex shrink-0 items-center lg:h-full lg:pr-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://wynncdn.shrglobal.com/CrsMedia/P13764/bbe/encore-animated-logo-wynn-resort-212-once.png"
              alt="Encore Boston Harbor"
              className="h-11 w-auto object-contain"
            />
          </div>

          <div className={DIVIDER} />

          {/* CHECK IN / CHECK OUT */}
          <div ref={calendarRef} className="relative flex items-center lg:h-full">
            {/* CHECK IN */}
            <button
              type="button"
              onClick={() => setShowCalendar((o) => !o)}
              aria-haspopup="dialog"
              aria-expanded={showCalendar}
              className="flex cursor-pointer flex-col justify-center gap-1.5 py-1 transition-colors hover:bg-gray-50 focus:outline-none lg:h-full lg:px-5 lg:py-0"
            >
              <span className={LABEL}>Check In</span>
              <div className="flex items-center gap-2">
                <span className={VALUE}>{checkIn ? fmtDate(checkIn) : 'Add Date'}</span>
                <Calendar className="h-4 w-4 shrink-0 text-[#626262]" />
              </div>
            </button>

            <div className={DIVIDER} />

            {/* CHECK OUT */}
            <button
              type="button"
              onClick={() => setShowCalendar((o) => !o)}
              aria-haspopup="dialog"
              aria-expanded={showCalendar}
              className="flex cursor-pointer flex-col justify-center gap-1.5 py-1 transition-colors hover:bg-gray-50 focus:outline-none lg:h-full lg:px-5 lg:py-0"
            >
              <span className={LABEL}>Check Out</span>
              <div className="flex items-center gap-2">
                <span className={VALUE}>{checkOut ? fmtDate(checkOut) : 'Add Date'}</span>
                <Calendar className="h-4 w-4 shrink-0 text-[#626262]" />
              </div>
            </button>

            {showCalendar && (
              <div className="absolute top-full left-0 z-50 mt-1 w-[680px] max-w-[calc(100vw-1rem)] overflow-x-hidden shadow-lg">
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

          <div className={DIVIDER} />

          <div className="grid grid-cols-2 gap-x-4 lg:contents">
            {/* ROOMS */}
            <div className="flex flex-col justify-center gap-2 py-1 lg:h-full lg:px-5 lg:py-0">
              <span className={LABEL}>Rooms</span>
              <div className="flex items-center gap-3">
                <CircleBtn
                  icon="-"
                  onClick={() => setRooms(Math.max(1, rooms - 1))}
                  disabled={rooms <= 1}
                  label="Remove 1 Room"
                />
                <span className={VALUE}>{rooms}</span>
                <CircleBtn
                  icon="+"
                  onClick={() => setRooms(Math.min(4, rooms + 1))}
                  disabled={rooms >= 4}
                  label="Add 1 Room"
                />
              </div>
            </div>

            <div className={DIVIDER} />

            {/* GUESTS PER ROOM */}
            <div className="flex flex-col justify-center gap-2 py-1 lg:h-full lg:px-5 lg:py-0">
              <span className={LABEL}>Guests Per Room</span>
              <div className="flex items-center gap-3">
                <CircleBtn
                  icon="-"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  disabled={guests <= 1}
                  label="Remove 1 Guest Per Room"
                />
                <span className={VALUE}>{guests}</span>
                <CircleBtn
                  icon="+"
                  onClick={() => setGuests(Math.min(4, guests + 1))}
                  disabled={guests >= 4}
                  label="Add 1 Guest Per Room"
                />
              </div>
            </div>
          </div>

          <div className={DIVIDER} />

          {/* PROMO CODE */}
          <div className="flex flex-col justify-center gap-2 py-1 lg:h-full lg:flex-1 lg:px-5 lg:py-0">
            <label htmlFor="booking-promo" className={LABEL}>
              Promo Code
            </label>
            <input
              id="booking-promo"
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="w-full border-b border-[#D8D8D8] bg-transparent pb-0.5 text-[15px] font-light text-[#626262] transition-colors outline-none focus:border-[#006F62]"
            />
          </div>

          {/* UPDATE */}
          <div className="flex shrink-0 items-center lg:h-full lg:pl-5">
            <button
              type="button"
              onClick={handleSearch}
              aria-label="Search available rooms"
              className="cursor-pointer bg-[#006F62] px-5 py-2 text-[14px] tracking-[0.4px] text-white uppercase transition-colors hover:bg-[#015A4F] focus:outline-none"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE: bottom sheet ────────────────────────────────────── */}
      {sheetOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
            onClick={closeSheet}
            aria-hidden="true"
          />

          {/* Sheet panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Booking options"
            className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[92vh] flex-col rounded-t-2xl bg-white shadow-2xl lg:hidden"
          >
            {/* Sheet header */}
            <div className="relative flex items-center justify-center border-b border-[#D8D8D8] px-4 py-4">
              <h2 className="font-[family-name:var(--font-heading)] text-[17px] font-medium">
                Select Dates
              </h2>
              <button
                type="button"
                onClick={closeSheet}
                aria-label="Close"
                className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-[#626262] hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sheet content — scrollable */}
            <div className="flex-1 overflow-y-auto">
              {sheetCalendar ? (
                /* Calendar view */
                <DateRangeCalendar
                  checkIn={checkIn}
                  checkOut={checkOut}
                  basePrice={basePrice}
                  dailyPrices={dailyPrices}
                  onSelect={(ci, co) => {
                    setDates(ci, co)
                    setSheetCalendar(false)
                  }}
                  onClose={() => setSheetCalendar(false)}
                  onMonthChange={(y, m) => {
                    setVisibleYear(y)
                    setVisibleMonth(m)
                  }}
                />
              ) : (
                /* Controls view */
                <div className="space-y-5 p-4">
                  {/* 2-column grid: dates | steppers */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    {/* Check In */}
                    <div className="flex flex-col gap-1.5">
                      <span className={LABEL}>Check In</span>
                      <button
                        type="button"
                        onClick={() => setSheetCalendar(true)}
                        className="flex cursor-pointer items-center justify-between border border-[#D8D8D8] px-3 py-2 text-sm text-[#626262] transition-colors hover:border-[#006F62]"
                      >
                        <span>{checkIn ? fmtLong(checkIn) : 'Add date'}</span>
                        <Calendar className="ml-2 h-4 w-4 shrink-0" />
                      </button>
                    </div>

                    {/* Rooms */}
                    <div className="flex flex-col gap-1.5">
                      <span className={LABEL}>Rooms</span>
                      <div className="flex items-center gap-3 py-1">
                        <CircleBtn
                          icon="-"
                          onClick={() => setRooms(Math.max(1, rooms - 1))}
                          disabled={rooms <= 1}
                          label="Remove 1 Room"
                        />
                        <span className={VALUE}>{rooms}</span>
                        <CircleBtn
                          icon="+"
                          onClick={() => setRooms(Math.min(4, rooms + 1))}
                          disabled={rooms >= 4}
                          label="Add 1 Room"
                        />
                      </div>
                    </div>

                    {/* Check Out */}
                    <div className="flex flex-col gap-1.5">
                      <span className={LABEL}>Check Out</span>
                      <button
                        type="button"
                        onClick={() => setSheetCalendar(true)}
                        className="flex cursor-pointer items-center justify-between border border-[#D8D8D8] px-3 py-2 text-sm text-[#626262] transition-colors hover:border-[#006F62]"
                      >
                        <span>{checkOut ? fmtLong(checkOut) : 'Add date'}</span>
                        <Calendar className="ml-2 h-4 w-4 shrink-0" />
                      </button>
                    </div>

                    {/* Guests Per Room */}
                    <div className="flex flex-col gap-1.5">
                      <span className={LABEL}>Guests Per Room</span>
                      <div className="flex items-center gap-3 py-1">
                        <CircleBtn
                          icon="-"
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          disabled={guests <= 1}
                          label="Remove 1 Guest Per Room"
                        />
                        <span className={VALUE}>{guests}</span>
                        <CircleBtn
                          icon="+"
                          onClick={() => setGuests(Math.min(4, guests + 1))}
                          disabled={guests >= 4}
                          label="Add 1 Guest Per Room"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Promo code */}
                  <div className="flex items-center gap-2 border border-[#D8D8D8] px-3 py-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter your promo code…"
                      className="flex-1 bg-transparent text-sm text-[#626262] outline-none placeholder:text-[#ADADAD]"
                    />
                    <button
                      type="button"
                      className="cursor-pointer text-[13px] font-semibold tracking-wide text-[#006F62] uppercase hover:text-[#015A4F]"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sheet footer */}
            <div className="flex items-center justify-between border-t border-[#D8D8D8] px-4 py-3">
              <span className="text-[13px] font-semibold tracking-wide text-[#626262] uppercase">
                {nights ? `${nights} Night${nights !== 1 ? 's' : ''}` : ''}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="cursor-pointer border border-[#626262] px-5 py-2 text-[13px] tracking-[0.4px] text-[#626262] uppercase transition-colors hover:border-black hover:text-black"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSearch()
                    closeSheet()
                  }}
                  className="cursor-pointer bg-[#006F62] px-5 py-2 text-[13px] tracking-[0.4px] text-white uppercase transition-colors hover:bg-[#015A4F]"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
