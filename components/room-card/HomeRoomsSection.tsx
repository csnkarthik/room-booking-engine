'use client'

import { useState, useMemo, useEffect } from 'react'
import { BookingBar } from '@/components/booking-bar/BookingBar'
import { RoomCard } from '@/components/room-card/RoomCard'
import { useBookingStore } from '@/lib/store/bookingStore'
import { cn } from '@/lib/utils'
import type { Room, RoomType } from '@/lib/types'

function isoDate(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

const CATEGORIES: { value: RoomType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'room', label: 'Encore Rooms' },
  { value: 'suite', label: 'Encore Suites' },
]

interface HomeRoomsSectionProps {
  rooms: Room[]
  minPrice: number
}

export function HomeRoomsSection({ rooms, minPrice }: HomeRoomsSectionProps) {
  const { checkIn, checkOut, guests, setDates, setGuests } = useBookingStore()
  const [category, setCategory] = useState<RoomType | 'all'>('all')

  const defaultCheckIn = checkIn ?? isoDate(1)
  const defaultCheckOut = checkOut ?? isoDate(4)
  const defaultGuests = checkIn ? guests : 2

  const [activeCheckIn, setActiveCheckIn] = useState<string | null>(defaultCheckIn)
  const [activeCheckOut, setActiveCheckOut] = useState<string | null>(defaultCheckOut)
  const [activeGuests, setActiveGuests] = useState<number | undefined>(defaultGuests)

  useEffect(() => {
    if (!checkIn) {
      setDates(isoDate(1), isoDate(4))
      setGuests(2)
    }
  }, [])

  const handleSearch = () => {
    setActiveCheckIn(checkIn)
    setActiveCheckOut(checkOut)
    setActiveGuests(guests > 0 ? guests : undefined)
  }

  const filtered = useMemo(() => {
    return rooms.filter((room) => {
      if (activeGuests && room.maxGuests < activeGuests) return false
      if (category !== 'all' && room.type !== category) return false
      return true
    })
  }, [rooms, activeGuests, category])

  const grouped = useMemo(() => {
    if (category !== 'all') return null
    const map = new Map<RoomType, Room[]>()
    for (const room of filtered) {
      const list = map.get(room.type) ?? []
      list.push(room)
      map.set(room.type, list)
    }
    return map
  }, [filtered, category])

  return (
    <div>
      {/* Sticky booking bar — full-width within the 1440px container */}
      <div className="sticky top-12 z-40">
        <BookingBar basePrice={minPrice} onSearch={handleSearch} />
      </div>

      <div className="px-4 py-10 sm:px-6 lg:px-12">
        {/* Category tabs */}
        <div
          className="mb-8 flex gap-0 border-b border-[#D8D8D8]"
          role="group"
          aria-label="Filter by category"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={cn(
                'cursor-pointer px-5 pb-3 text-[11px] font-black tracking-[1.5px] uppercase transition-colors',
                category === cat.value
                  ? 'border-b-2 border-[#006F62] text-[#006F62]'
                  : 'text-[#626262] hover:text-[#101010]'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-[#626262]">No rooms match your criteria.</p>
          </div>
        ) : grouped ? (
          <div className="space-y-12">
            {Array.from(grouped.entries()).map(([type, typeRooms]) => (
              <section key={type}>
                <h2 className="mb-5 font-[family-name:var(--font-heading)] text-2xl font-medium tracking-wide text-[#101010]">
                  {CATEGORIES.find((cat) => cat.value === type)?.label}
                  <span className="ml-2 font-sans text-sm font-normal text-[#8D8D8D]">
                    ({typeRooms.length})
                  </span>
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {typeRooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      checkIn={activeCheckIn}
                      checkOut={activeCheckOut}
                      guests={activeGuests}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                checkIn={activeCheckIn}
                checkOut={activeCheckOut}
                guests={activeGuests}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
