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
  { value: 'suite', label: 'Encore Suites' },
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
      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#8D8D8D]" />
        <Input
          type="search"
          placeholder="Search rooms, amenities…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-none border-[#D8D8D8] pl-9 focus-visible:ring-[#006F62]"
          aria-label="Search rooms"
        />
      </div>

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
              'px-5 pb-3 text-[11px] font-black tracking-[1.5px] uppercase transition-colors',
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
          <p className="text-lg text-[#626262]">No rooms match your search.</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 text-[#006F62] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Modify search
          </Link>
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
