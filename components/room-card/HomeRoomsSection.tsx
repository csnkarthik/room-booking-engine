'use client'

import { useState, useMemo } from 'react'
import { BookingBar } from '@/components/booking-bar/BookingBar'
import { RoomCard } from '@/components/room-card/RoomCard'
import { useBookingStore } from '@/lib/store/bookingStore'
import { cn } from '@/lib/utils'
import type { Room, RoomType } from '@/lib/types'

const CATEGORIES: { value: RoomType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'suite', label: 'Suite' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'penthouse', label: 'Penthouse' },
]

interface HomeRoomsSectionProps {
  rooms: Room[]
  minPrice: number
}

export function HomeRoomsSection({ rooms, minPrice }: HomeRoomsSectionProps) {
  const { checkIn, checkOut, guests } = useBookingStore()
  const [category, setCategory] = useState<RoomType | 'all'>('all')
  // Triggered when user clicks Search — snapshot the store values
  const [activeCheckIn, setActiveCheckIn] = useState<string | null>(null)
  const [activeCheckOut, setActiveCheckOut] = useState<string | null>(null)
  const [activeGuests, setActiveGuests] = useState<number | undefined>(undefined)

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
      {/* Booking bar */}
      <div className="sticky top-0 z-40 -mx-4 bg-white px-4 pt-3 pb-3 shadow-sm">
        <BookingBar basePrice={minPrice} onSearch={handleSearch} />
      </div>

      {/* Category pills */}
      <div className="mt-4 mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setCategory(cat.value)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              category === cat.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'hover:border-primary hover:text-primary border-slate-200 bg-white text-slate-600'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-muted-foreground text-lg">No rooms match your criteria.</p>
        </div>
      ) : grouped ? (
        <div className="space-y-10">
          {Array.from(grouped.entries()).map(([type, typeRooms]) => (
            <section key={type}>
              <h2 className="mb-4 text-lg font-semibold text-slate-800 capitalize">
                {type} Rooms
                <span className="text-muted-foreground ml-2 text-sm font-normal">
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
  )
}
