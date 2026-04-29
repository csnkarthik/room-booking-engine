'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { DateRangeCalendar } from '@/components/calendar/DateRangeCalendar'
import { useBookingStore } from '@/lib/store/bookingStore'
import { useCalendarPricing } from '@/lib/hooks/useCalendarPricing'
import { calculateStayPrice } from '@/lib/utils/pricing'
import { formatCurrency, formatDisplayDate } from '@/lib/utils/dates'
import type { Room, Availability, CartItem, RoomType, DateRange } from '@/lib/types'

const VALID_TYPES: RoomType[] = ['suite', 'room']

const roomTypeLabels: Record<string, string> = {
  suite: 'Suite',
  room: 'Resort Room',
}

function resolveRoomType(type: string): RoomType {
  return VALID_TYPES.includes(type as RoomType) ? (type as RoomType) : 'room'
}

function monthBounds(year: number, month: number): { startDate: string; endDate: string } {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

function isDateRangeBlocked(
  checkIn: string,
  checkOut: string,
  blockedRanges: DateRange[]
): boolean {
  return blockedRanges.some((r) => checkIn < r.to && checkOut > r.from)
}

// ── Room list item for Modal 2 ──
interface RoomListItemProps {
  room: Room
  checkIn: string | null
  checkOut: string | null
  isCurrentRoom: boolean
  onSelect: () => void
}

function RoomListItem({ room, checkIn, checkOut, isCurrentRoom, onSelect }: RoomListItemProps) {
  const { data: roomData } = useQuery<{ room: Room; availability: Availability }>({
    queryKey: ['room', room.id],
    queryFn: async () => {
      const res = await fetch(`/api/rooms/${room.id}`)
      if (!res.ok) throw new Error('Failed to fetch room')
      return res.json() as Promise<{ room: Room; availability: Availability }>
    },
    staleTime: 5 * 60 * 1000,
  })

  const totalPrice =
    checkIn && checkOut
      ? calculateStayPrice(room.pricePerNight, checkIn, checkOut, {
          breakfast: false,
          airportTransfer: false,
          lateCheckout: false,
        })
      : room.pricePerNight

  const unavailable =
    checkIn && checkOut && roomData?.availability
      ? isDateRangeBlocked(checkIn, checkOut, roomData.availability.blockedRanges)
      : false

  return (
    <div className="flex items-start gap-4 border-b border-[#D8D8D8] px-6 py-5 last:border-b-0">
      <div className="relative h-[88px] w-[120px] shrink-0 overflow-hidden">
        <Image src={room.images[0]} alt={room.name} fill className="object-cover" sizes="120px" />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="font-semibold text-[#101010]">{room.name}</p>
        <p className="mt-0.5 text-sm text-[#101010]">{formatCurrency(totalPrice)}</p>
        <p className="text-xs text-[#8D8D8D]">Excludes Taxes.</p>
        {isCurrentRoom ? (
          <p className="mt-2 text-[10px] font-black tracking-[1.5px] text-[#006F62] uppercase">
            Current Room
          </p>
        ) : unavailable ? (
          <p className="mt-2 text-[10px] font-black tracking-[1.5px] text-[#8D8D8D] uppercase">
            Unavailable
          </p>
        ) : (
          <button
            onClick={onSelect}
            className="mt-2 cursor-pointer bg-[#006F62] px-5 py-2 text-[11px] font-black tracking-[1.5px] text-white uppercase transition-colors hover:bg-[#008475]"
          >
            Select
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main dialog ──
interface ModifyBookingDialogProps {
  open: boolean
  onClose: () => void
  itemIndex: number
  cartItem: CartItem
}

export function ModifyBookingDialog({
  open,
  onClose,
  itemIndex,
  cartItem,
}: ModifyBookingDialogProps) {
  const { updateCartItem } = useBookingStore()

  const [step, setStep] = useState<'summary' | 'rooms'>('summary')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room>(cartItem.room)
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType>(
    resolveRoomType(cartItem.room.type)
  )
  const [localCheckIn, setLocalCheckIn] = useState(cartItem.checkIn)
  const [localCheckOut, setLocalCheckOut] = useState(cartItem.checkOut)
  const [localGuests, setLocalGuests] = useState(cartItem.guests)

  const today = new Date()
  const [visibleYear, setVisibleYear] = useState(today.getFullYear())
  const [visibleMonth, setVisibleMonth] = useState(today.getMonth())

  useEffect(() => {
    if (open) {
      setStep('summary')
      setCalendarOpen(false)
      setSelectedRoom(cartItem.room)
      setSelectedRoomType(resolveRoomType(cartItem.room.type))
      setLocalCheckIn(cartItem.checkIn)
      setLocalCheckOut(cartItem.checkOut)
      setLocalGuests(cartItem.guests)
      setVisibleYear(today.getFullYear())
      setVisibleMonth(today.getMonth())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const { data: allRooms = [] } = useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await fetch('/api/rooms')
      if (!res.ok) throw new Error('Failed to fetch rooms')
      return res.json() as Promise<Room[]>
    },
    staleTime: 5 * 60 * 1000,
    enabled: open,
  })

  // Availability for the selected room's calendar only
  const { data: roomData } = useQuery<{ room: Room; availability: Availability }>({
    queryKey: ['room', selectedRoom.id],
    queryFn: async () => {
      const res = await fetch(`/api/rooms/${selectedRoom.id}`)
      if (!res.ok) throw new Error('Failed to fetch room')
      return res.json() as Promise<{ room: Room; availability: Availability }>
    },
    staleTime: 5 * 60 * 1000,
    enabled: open && calendarOpen,
  })

  const availability = roomData?.availability

  const { startDate, endDate } = monthBounds(visibleYear, visibleMonth)
  const { dailyPrices, isLoading: pricesLoading } = useCalendarPricing(
    selectedRoom.id,
    localGuests,
    startDate,
    endDate
  )

  const filteredRooms = allRooms.filter((r) => r.type === selectedRoomType && r.available)

  const currentTotal =
    localCheckIn && localCheckOut
      ? calculateStayPrice(selectedRoom.pricePerNight, localCheckIn, localCheckOut, cartItem.extras)
      : 0

  function handleRoomSelect(room: Room) {
    setSelectedRoom(room)
    if (localGuests > room.maxGuests) setLocalGuests(room.maxGuests)
    setStep('summary')
  }

  function handleUpdate() {
    if (!localCheckIn || !localCheckOut) return
    const newTotal = calculateStayPrice(
      selectedRoom.pricePerNight,
      localCheckIn,
      localCheckOut,
      cartItem.extras
    )
    updateCartItem(itemIndex, {
      room: selectedRoom,
      checkIn: localCheckIn,
      checkOut: localCheckOut,
      guests: localGuests,
      totalPrice: newTotal,
    })
    onClose()
  }

  if (!open) return null

  const backdropCls =
    'fixed inset-0 z-50 flex flex-col bg-black/60 md:items-center md:justify-center md:p-6'

  // ── Step 2: Room list ──
  if (step === 'rooms') {
    return (
      <div
        className={backdropCls}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rooms-dialog-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className="relative flex h-full w-full flex-col bg-white md:h-auto md:max-h-[90vh] md:max-w-lg">
          {/* Header */}
          <div className="flex shrink-0 items-center border-b border-[#D8D8D8] px-4 py-4">
            <button
              onClick={() => setStep('summary')}
              className="flex cursor-pointer items-center gap-1 text-sm text-[#626262] transition-colors hover:text-[#101010]"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <h2
              id="rooms-dialog-title"
              className="flex-1 text-center font-[family-name:var(--font-heading)] text-lg font-medium text-[#101010]"
            >
              Room Types:
            </h2>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="cursor-pointer p-1 text-[#626262] transition-colors hover:text-[#101010]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Room type tabs */}
          <div className="flex shrink-0 border-b border-[#D8D8D8]">
            {(['suite', 'room'] as RoomType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedRoomType(type)}
                className={`flex-1 cursor-pointer py-3 text-[11px] font-black tracking-[1.5px] uppercase transition-colors ${
                  selectedRoomType === type
                    ? 'border-b-2 border-[#006F62] text-[#006F62]'
                    : 'text-[#8D8D8D] hover:text-[#101010]'
                }`}
              >
                {roomTypeLabels[type]}
              </button>
            ))}
          </div>

          {/* Room list */}
          <div className="flex-1 overflow-y-auto">
            {filteredRooms.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-[#8D8D8D]">No rooms available.</p>
            ) : (
              filteredRooms.map((room) => (
                <RoomListItem
                  key={room.id}
                  room={room}
                  checkIn={localCheckIn}
                  checkOut={localCheckOut}
                  isCurrentRoom={room.id === selectedRoom.id}
                  onSelect={() => handleRoomSelect(room)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Step 1: Summary ──
  return (
    <div
      className={backdropCls}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modify-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative flex h-full w-full flex-col bg-white md:h-auto md:max-h-[90vh] md:max-w-lg">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#D8D8D8] px-6 py-5">
          <h2
            id="modify-dialog-title"
            className="font-[family-name:var(--font-heading)] text-xl font-medium text-[#101010]"
          >
            Modify Your Visit
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="cursor-pointer p-1 text-[#626262] transition-colors hover:text-[#101010]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* CHECK IN / CHECK OUT row */}
          <button
            className="flex w-full cursor-pointer items-start justify-between border-b border-[#D8D8D8] px-6 py-5 text-left transition-colors hover:bg-[#FAFAFA]"
            onClick={() => setCalendarOpen((v) => !v)}
            aria-expanded={calendarOpen}
          >
            <div>
              <p className="text-sm text-[#101010]">
                <span className="text-[10px] font-black tracking-[1.5px] uppercase">
                  Check In:{' '}
                </span>
                {localCheckIn ? formatDisplayDate(localCheckIn) : '—'}
              </p>
              <p className="mt-1 text-sm text-[#101010]">
                <span className="text-[10px] font-black tracking-[1.5px] uppercase">
                  Check Out:{' '}
                </span>
                {localCheckOut ? formatDisplayDate(localCheckOut) : '—'}
              </p>
            </div>
            <ChevronRight
              className={`mt-1 h-4 w-4 shrink-0 text-[#8D8D8D] transition-transform ${calendarOpen ? 'rotate-90' : ''}`}
            />
          </button>

          {/* Inline calendar */}
          {calendarOpen && (
            <div className="border-b border-[#D8D8D8] px-4 py-4">
              {pricesLoading && <p className="mb-2 text-[10px] text-[#8D8D8D]">Loading prices…</p>}
              <DateRangeCalendar
                checkIn={localCheckIn}
                checkOut={localCheckOut}
                availability={availability}
                dailyPrices={dailyPrices}
                basePrice={selectedRoom.pricePerNight}
                onSelect={(ci, co) => {
                  setLocalCheckIn(ci)
                  setLocalCheckOut(co)
                }}
                onMonthChange={(year, month) => {
                  setVisibleYear(year)
                  setVisibleMonth(month)
                }}
              />
            </div>
          )}

          {/* GUESTS PER ROOM row */}
          <div className="border-b border-[#D8D8D8] px-6 py-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-[1.5px] text-[#101010] uppercase">
                Guests per Room
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLocalGuests(Math.max(1, localGuests - 1))}
                  disabled={localGuests <= 1}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#D8D8D8] text-[#626262] transition-colors hover:border-[#006F62] hover:text-[#006F62] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Decrease guests"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-semibold text-[#101010]">
                  {localGuests}
                </span>
                <button
                  type="button"
                  onClick={() => setLocalGuests(Math.min(4, localGuests + 1))}
                  disabled={localGuests >= 4}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#D8D8D8] text-[#626262] transition-colors hover:border-[#006F62] hover:text-[#006F62] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Increase guests"
                >
                  +
                </button>
              </div>
            </div>
            {localGuests > selectedRoom.maxGuests && (
              <p className="mt-2 text-xs text-red-600">
                Selected room accommodates up to {selectedRoom.maxGuests}{' '}
                {selectedRoom.maxGuests === 1 ? 'guest' : 'guests'}. Please choose a different room
                or reduce guests.
              </p>
            )}
          </div>

          {/* ROOM TYPE row */}
          <button
            className="flex w-full cursor-pointer items-center justify-between border-b border-[#D8D8D8] px-6 py-5 text-left transition-colors hover:bg-[#FAFAFA]"
            onClick={() => setStep('rooms')}
          >
            <div>
              <span className="text-[10px] font-black tracking-[1.5px] text-[#101010] uppercase">
                Room Type:{' '}
              </span>
              <span className="text-sm text-[#626262]">{selectedRoom.name}</span>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#8D8D8D]" />
          </button>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-end justify-between border-t border-[#D8D8D8] px-6 py-5">
          <div>
            <p className="text-sm font-black tracking-wide text-[#101010] uppercase">
              Subtotal: {formatCurrency(currentTotal)}
            </p>
            <p className="mt-0.5 text-xs text-[#8D8D8D]">Excludes Taxes.</p>
          </div>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={!localCheckIn || !localCheckOut || localGuests > selectedRoom.maxGuests}
            className="cursor-pointer bg-[#006F62] px-6 py-3 text-[11px] font-black tracking-[1.5px] text-white uppercase transition-colors hover:bg-[#008475] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  )
}
