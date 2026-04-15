import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { RoomsListWithFilter } from '@/components/room-card/RoomsListWithFilter'
import { readRooms } from '@/lib/utils/data'
import { formatDisplayDate } from '@/lib/utils/dates'
import type { Room } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{
    checkIn?: string
    checkOut?: string
    guests?: string
  }>
}

function filterRooms(rooms: Room[], guests?: number): Room[] {
  return rooms.filter((room) => {
    if (guests && room.maxGuests < guests) return false
    return room.available
  })
}

async function RoomsList({
  checkIn,
  checkOut,
  guests,
}: {
  checkIn?: string
  checkOut?: string
  guests?: number
}) {
  const allRooms = readRooms()
  const rooms = filterRooms(allRooms, guests)

  return <RoomsListWithFilter rooms={rooms} checkIn={checkIn} checkOut={checkOut} guests={guests} />
}

export default async function RoomsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const guests = params.guests ? parseInt(params.guests) : undefined
  const hasDates = params.checkIn && params.checkOut

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Back to home">
              <ArrowLeft className="text-muted-foreground hover:text-foreground h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Available Rooms</h1>
              {hasDates && (
                <p className="text-muted-foreground text-xs">
                  {formatDisplayDate(params.checkIn!)} → {formatDisplayDate(params.checkOut!)}
                  {guests ? ` · ${guests} guest${guests > 1 ? 's' : ''}` : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Suspense
          fallback={
            <div className="space-y-10">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i}>
                  <div className="bg-muted mb-4 h-6 w-32 animate-pulse rounded" />
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="bg-muted aspect-[4/5] animate-pulse rounded-2xl" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <RoomsList checkIn={params.checkIn} checkOut={params.checkOut} guests={guests} />
        </Suspense>
      </main>
    </div>
  )
}
