'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { RoomCard } from '@/components/room-card/RoomCard'
import { cn } from '@/lib/utils'
import type { Room, RoomType } from '@/lib/types'

const CATEGORIES: { value: RoomType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'room', label: 'Encore Rooms' },
  //{ value: 'double', label: 'Double' },
  { value: 'suite', label: 'Encore Suites' },
  //{ value: 'deluxe', label: 'Deluxe' },
  //{ value: 'penthouse', label: 'Penthouse' },
]

interface RoomsListWithFilterProps {
  rooms: Room[]
  checkIn?: string
  checkOut?: string
  guests?: number
  apiPrices?: Map<string, number>
}

export function RoomsListWithFilter({
  rooms,
  checkIn,
  checkOut,
  guests,
  apiPrices,
}: RoomsListWithFilterProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<RoomType | 'all'>('all')

  const filtered = useMemo(() => {
    return rooms.filter((room) => {
      if (category !== 'all' && room.type !== category) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        return (
          room.name.toLowerCase().includes(q) ||
          room.description.toLowerCase().includes(q) ||
          room.amenities.some((a) => a.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [rooms, query, category])

  // Group by category when "all" is selected and no search query
  const grouped = useMemo(() => {
    if (category !== 'all' || query.trim()) return null
    const map = new Map<RoomType, Room[]>()
    for (const room of filtered) {
      const list = map.get(room.type) ?? []
      list.push(room)
      map.set(room.type, list)
    }
    return map
  }, [filtered, category, query])

  return (
    <div>
      {/* Search + filter bar */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Search rooms, amenities…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            aria-label="Search rooms"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={cn(
                'rounded-none border px-5 py-1.5 text-xs font-medium tracking-widest uppercase transition-colors',
                category === cat.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'hover:border-primary hover:bg-primary hover:text-primary-foreground border-[#E8D9C5] bg-white text-[#7B5135]'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-muted-foreground text-lg">No rooms match your search.</p>
          <Link
            href="/"
            className="text-primary mt-4 inline-flex items-center gap-2 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Modify search
          </Link>
        </div>
      ) : grouped ? (
        // Categorized view
        <div className="space-y-10">
          {Array.from(grouped.entries()).map(([type, typeRooms]) => (
            <section key={type}>
              <h2 className="text-foreground mb-4 font-[family-name:var(--font-heading)] text-2xl font-semibold tracking-wide capitalize">
                {CATEGORIES.find((cat) => cat.value === type)?.label}
                <span className="text-muted-foreground ml-2 font-sans text-sm font-normal">
                  ({typeRooms.length})
                </span>
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {typeRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    guests={guests}
                    apiPricePerNight={apiPrices?.get(room.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        // Flat filtered view
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              apiPricePerNight={apiPrices?.get(room.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
