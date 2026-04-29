'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { DateRangeCalendar } from '@/components/calendar/DateRangeCalendar'
import { useBookingStore } from '@/lib/store/bookingStore'
import { useCalendarPricing } from '@/lib/hooks/useCalendarPricing'
import { daysBetween } from '@/lib/utils/dates'
import { cn } from '@/lib/utils'

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 30 30"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7.555 0.529 C 7.163 0.635,6.818 0.837,6.497 1.150 C 5.995 1.640,5.850 2.072,5.850 3.082 L 5.850 3.744 3.913 3.759 L 1.975 3.775 1.600 3.955 C 1.157 4.169,0.805 4.504,0.610 4.900 L 0.475 5.175 0.475 16.650 L 0.475 28.125 0.605 28.403 C 0.837 28.897,1.328 29.307,1.894 29.479 C 2.240 29.584,27.760 29.584,28.106 29.479 C 28.672 29.307,29.163 28.897,29.395 28.403 L 29.525 28.125 29.525 16.725 L 29.525 5.325 29.380 5.010 C 29.202 4.625,28.857 4.298,28.400 4.080 L 28.075 3.925 26.118 3.911 L 24.161 3.897 24.139 3.036 C 24.114 2.072,24.054 1.837,23.723 1.387 C 23.063 0.489,21.737 0.195,20.713 0.720 C 20.144 1.011,19.678 1.603,19.555 2.190 C 19.525 2.336,19.500 2.780,19.500 3.177 L 19.500 3.900 15.000 3.900 L 10.500 3.900 10.500 3.177 C 10.500 2.374,10.448 2.045,10.262 1.676 C 10.107 1.369,9.657 0.921,9.319 0.739 C 8.801 0.460,8.117 0.378,7.555 0.529 M8.808 1.614 C 9.202 1.817,9.427 2.120,9.475 2.513 C 9.493 2.657,9.500 3.664,9.491 4.750 L 9.475 6.725 9.342 6.950 C 9.111 7.343,8.718 7.550,8.203 7.550 C 7.798 7.550,7.487 7.429,7.228 7.170 C 6.873 6.815,6.875 6.832,6.875 4.500 C 6.875 2.207,6.876 2.200,7.188 1.878 C 7.629 1.422,8.243 1.322,8.808 1.614 M22.375 1.568 C 22.675 1.708,22.976 2.006,23.062 2.248 C 23.155 2.509,23.152 6.499,23.059 6.762 C 22.965 7.026,22.601 7.373,22.317 7.470 C 21.671 7.690,20.984 7.456,20.660 6.905 L 20.525 6.675 20.509 4.725 C 20.500 3.652,20.507 2.657,20.525 2.513 C 20.624 1.706,21.602 1.207,22.375 1.568 M5.850 5.664 C 5.850 6.960,5.959 7.325,6.508 7.862 C 7.033 8.376,7.598 8.581,8.369 8.537 C 9.130 8.495,9.649 8.223,10.075 7.644 C 10.413 7.185,10.461 6.980,10.488 5.863 L 10.511 4.900 15.005 4.900 L 19.500 4.900 19.500 5.723 C 19.500 6.175,19.525 6.664,19.555 6.810 C 19.714 7.570,20.358 8.225,21.195 8.479 C 21.488 8.568,22.100 8.569,22.432 8.480 C 23.035 8.320,23.694 7.794,23.925 7.288 C 24.106 6.893,24.150 6.581,24.150 5.681 L 24.150 4.875 26.046 4.900 L 27.942 4.925 28.153 5.075 C 28.570 5.371,28.550 5.196,28.550 8.487 L 28.550 11.400 15.000 11.400 L 1.450 11.400 1.450 8.423 C 1.450 5.187,1.439 5.319,1.733 5.040 C 2.029 4.759,2.068 4.754,4.038 4.752 L 5.850 4.750 5.850 5.664 M28.550 20.140 L 28.550 27.880 28.413 28.092 C 28.323 28.231,28.191 28.346,28.028 28.427 L 27.780 28.550 15.000 28.550 L 2.220 28.550 1.972 28.427 C 1.809 28.346,1.677 28.231,1.587 28.092 L 1.450 27.880 1.450 20.140 L 1.450 12.400 15.000 12.400 L 28.550 12.400 28.550 20.140 M5.511 15.128 C 5.408 15.200,5.400 15.244,5.400 15.749 C 5.400 16.465,5.384 16.450,6.150 16.450 L 6.743 16.450 6.847 16.305 C 6.932 16.185,6.950 16.084,6.950 15.728 C 6.950 15.335,6.939 15.284,6.827 15.173 C 6.712 15.058,6.671 15.050,6.163 15.050 C 5.755 15.050,5.595 15.069,5.511 15.128 M8.973 15.173 C 8.860 15.285,8.850 15.333,8.850 15.762 C 8.850 16.448,8.852 16.450,9.624 16.450 C 10.420 16.450,10.400 16.468,10.400 15.749 C 10.400 15.052,10.397 15.050,9.637 15.050 C 9.129 15.050,9.088 15.058,8.973 15.173 M12.611 15.128 C 12.508 15.200,12.500 15.244,12.500 15.749 C 12.500 16.465,12.484 16.450,13.250 16.450 L 13.843 16.450 13.947 16.305 C 14.032 16.185,14.050 16.084,14.050 15.728 C 14.050 15.335,14.039 15.284,13.927 15.173 C 13.812 15.058,13.771 15.050,13.263 15.050 C 12.855 15.050,12.695 15.069,12.611 15.128 M16.073 15.173 C 15.960 15.285,15.950 15.333,15.950 15.762 C 15.950 16.448,15.952 16.450,16.724 16.450 C 17.520 16.450,17.500 16.468,17.500 15.749 C 17.500 15.052,17.497 15.050,16.737 15.050 C 16.229 15.050,16.188 15.058,16.073 15.173 M19.711 15.128 C 19.608 15.200,19.600 15.244,19.600 15.749 C 19.600 16.461,19.588 16.450,20.319 16.450 C 20.870 16.450,20.884 16.447,21.016 16.310 C 21.141 16.179,21.150 16.139,21.150 15.732 C 21.150 15.335,21.139 15.284,21.027 15.173 C 20.912 15.058,20.871 15.050,20.363 15.050 C 19.955 15.050,19.795 15.069,19.711 15.128 M23.173 15.173 C 23.060 15.285,23.050 15.333,23.050 15.762 C 23.050 16.448,23.052 16.450,23.824 16.450 C 24.620 16.450,24.600 16.468,24.600 15.749 C 24.600 15.052,24.597 15.050,23.837 15.050 C 23.329 15.050,23.288 15.058,23.173 15.173 M5.483 19.491 C 5.417 19.564,5.400 19.690,5.400 20.114 C 5.400 20.798,5.402 20.800,6.182 20.800 C 6.728 20.800,6.745 20.797,6.846 20.668 C 6.934 20.556,6.950 20.466,6.950 20.068 C 6.950 19.413,6.935 19.400,6.158 19.400 C 5.647 19.400,5.554 19.413,5.483 19.491 M8.950 19.500 C 8.864 19.586,8.850 19.667,8.850 20.068 C 8.850 20.466,8.866 20.556,8.954 20.668 C 9.055 20.798,9.068 20.800,9.669 20.800 C 10.077 20.800,10.300 20.780,10.340 20.740 C 10.379 20.701,10.400 20.489,10.400 20.123 C 10.400 19.390,10.410 19.400,9.634 19.400 C 9.117 19.400,9.039 19.411,8.950 19.500 M12.583 19.491 C 12.517 19.564,12.500 19.690,12.500 20.114 C 12.500 20.798,12.502 20.800,13.282 20.800 C 13.828 20.800,13.845 20.797,13.946 20.668 C 14.034 20.556,14.050 20.466,14.050 20.068 C 14.050 19.413,14.035 19.400,13.258 19.400 C 12.747 19.400,12.654 19.413,12.583 19.491 M16.050 19.500 C 15.964 19.586,15.950 19.667,15.950 20.068 C 15.950 20.466,15.966 20.556,16.054 20.668 C 16.155 20.798,16.168 20.800,16.769 20.800 C 17.177 20.800,17.400 20.780,17.440 20.740 C 17.479 20.701,17.500 20.489,17.500 20.123 C 17.500 19.390,17.510 19.400,16.734 19.400 C 16.217 19.400,16.139 19.411,16.050 19.500 M19.683 19.491 C 19.617 19.564,19.600 19.690,19.600 20.114 C 19.600 20.796,19.605 20.800,20.364 20.800 C 20.885 20.800,20.909 20.795,21.027 20.668 C 21.139 20.547,21.150 20.495,21.150 20.068 C 21.150 19.413,21.135 19.400,20.358 19.400 C 19.847 19.400,19.754 19.413,19.683 19.491 M23.150 19.500 C 23.064 19.586,23.050 19.667,23.050 20.068 C 23.050 20.466,23.066 20.556,23.154 20.668 C 23.255 20.798,23.268 20.800,23.869 20.800 C 24.277 20.800,24.500 20.780,24.540 20.740 C 24.579 20.701,24.600 20.489,24.600 20.123 C 24.600 19.390,24.610 19.400,23.834 19.400 C 23.317 19.400,23.239 19.411,23.150 19.500 M5.483 23.941 C 5.417 24.014,5.400 24.140,5.400 24.564 C 5.400 25.247,5.403 25.250,6.177 25.250 L 6.731 25.250 6.845 25.096 C 6.949 24.956,6.958 24.897,6.942 24.467 C 6.920 23.850,6.920 23.850,6.148 23.850 C 5.647 23.850,5.554 23.863,5.483 23.941 M8.946 23.954 C 8.850 24.050,8.843 24.106,8.858 24.584 C 8.880 25.254,8.875 25.250,9.623 25.250 C 10.399 25.250,10.400 25.249,10.400 24.555 C 10.400 23.843,10.408 23.850,9.634 23.850 C 9.108 23.850,9.040 23.860,8.946 23.954 M12.583 23.941 C 12.517 24.014,12.500 24.140,12.500 24.564 C 12.500 25.247,12.503 25.250,13.277 25.250 L 13.831 25.250 13.941 25.102 C 14.034 24.975,14.050 24.889,14.050 24.502 C 14.050 23.865,14.032 23.850,13.258 23.850 C 12.747 23.850,12.654 23.863,12.583 23.941 M16.046 23.954 C 15.950 24.050,15.943 24.106,15.958 24.584 C 15.980 25.254,15.975 25.250,16.723 25.250 C 17.499 25.250,17.500 25.249,17.500 24.555 C 17.500 23.843,17.508 23.850,16.734 23.850 C 16.208 23.850,16.140 23.860,16.046 23.954 M19.683 23.941 C 19.617 24.014,19.600 24.140,19.600 24.564 C 19.600 25.240,19.611 25.250,20.319 25.250 C 20.774 25.250,20.829 25.239,20.983 25.122 L 21.150 24.995 21.150 24.522 C 21.150 23.862,21.136 23.850,20.358 23.850 C 19.847 23.850,19.754 23.863,19.683 23.941 M23.150 23.950 C 23.065 24.035,23.050 24.117,23.050 24.503 C 23.050 24.934,23.097 25.130,23.220 25.212 C 23.250 25.232,23.523 25.249,23.826 25.249 C 24.598 25.250,24.600 25.249,24.600 24.555 C 24.600 23.843,24.608 23.850,23.834 23.850 C 23.317 23.850,23.239 23.861,23.150 23.950 "
        stroke="none"
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  )
}

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
const DIVIDER = 'hidden lg:block w-px h-10 my-auto bg-[#D8D8D8] mx-1 shrink-0'

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
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6 lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.ctfassets.net/qroo0r04c02g/5p78pbHlHkjEvU9yRbRCQ6/f1544afe51ba329c5989fada417b94bd/ebh-animated-2.gif"
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
        <div className="mx-auto hidden max-w-[1440px] gap-0 px-4 sm:px-6 lg:flex lg:h-[94px] lg:items-center lg:px-12">
          {/* Logo */}
          <div className="flex shrink-0 items-center lg:h-full lg:pr-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.ctfassets.net/qroo0r04c02g/5p78pbHlHkjEvU9yRbRCQ6/f1544afe51ba329c5989fada417b94bd/ebh-animated-2.gif"
              alt="Encore Boston Harbor"
              className="h-11 w-auto object-contain"
            />
          </div>

          <div className={DIVIDER} />

          {/* CHECK IN / CHECK OUT */}
          <div ref={calendarRef} className="relative flex items-center lg:h-full">
            {/* CHECK IN / CHECK OUT — combined */}
            <button
              type="button"
              onClick={() => setShowCalendar((o) => !o)}
              aria-haspopup="dialog"
              aria-expanded={showCalendar}
              className="flex cursor-pointer flex-col justify-center gap-1.5 py-1 transition-colors hover:bg-gray-50 focus:outline-none lg:h-full lg:px-5 lg:py-0"
            >
              <div className="flex items-center gap-6">
                <span className={LABEL}>Check In</span>
                <span className={LABEL}>Check Out</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={VALUE}>
                  {checkIn ? fmtDate(checkIn) : '—'}&nbsp;–&nbsp;
                  {checkOut ? fmtDate(checkOut) : '—'}
                </span>
                <CalendarIcon className="h-4 w-4 shrink-0 text-[#626262]" />
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
              className="cursor-pointer bg-[#006F62] px-9 py-2 text-[14px] tracking-[0.4px] text-white uppercase transition-colors hover:bg-[#015A4F] focus:outline-none"
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
                        <CalendarIcon className="ml-2 h-4 w-4 shrink-0" />
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
                        <CalendarIcon className="ml-2 h-4 w-4 shrink-0" />
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
