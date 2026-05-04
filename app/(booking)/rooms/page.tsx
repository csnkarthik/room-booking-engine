import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { RoomsListWithFilter } from '@/components/room-card/RoomsListWithFilter'
import { readRooms } from '@/lib/utils/data'
import { getAvailableRoomTypes } from '@/lib/services/hospitalityAvailability'
import { formatDisplayDate } from '@/lib/utils/dates'
import type { Room } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{
    checkIn?: string
    checkOut?: string
    guests?: string
    rooms?: string
  }>
}

async function RoomsList({
  checkIn,
  checkOut,
  guests,
  roomCount,
}: {
  checkIn?: string
  checkOut?: string
  guests?: number
  roomCount?: number
}) {
  const allRooms = readRooms()

  let apiAvailability: Map<string, number> | null = null
  if (checkIn && checkOut) {
    try {
      apiAvailability = await getAvailableRoomTypes({
        checkIn,
        checkOut,
        adults: guests ?? 1,
        rooms: roomCount ?? 1,
      })
    } catch (err) {
      console.error('[hospitality] availability fetch failed, falling back to JSON:', err)
    }
  }

  const rooms = allRooms.filter((room: Room) => {
    if (guests && room.maxGuests < guests) return false
    if (apiAvailability !== null) return apiAvailability.has(room.id)
    return room.available
  })

  return (
    <RoomsListWithFilter
      rooms={rooms}
      checkIn={checkIn}
      checkOut={checkOut}
      guests={guests}
      apiPrices={apiAvailability ?? undefined}
    />
  )
}

export default async function RoomsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const guests = params.guests ? parseInt(params.guests) : undefined
  const roomCount = params.rooms ? parseInt(params.rooms) : undefined
  const hasDates = params.checkIn && params.checkOut

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-[1140px] px-4 py-8 sm:px-6 lg:px-12">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/"
            aria-label="Back to home"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold tracking-wide">
              Available Rooms
            </h1>
            {hasDates && (
              <p className="text-muted-foreground text-xs tracking-wider">
                {formatDisplayDate(params.checkIn!)} — {formatDisplayDate(params.checkOut!)}
                {guests ? ` · ${guests} guest${guests > 1 ? 's' : ''}` : ''}
              </p>
            )}
          </div>
        </div>
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
          <RoomsList
            checkIn={params.checkIn}
            checkOut={params.checkOut}
            guests={guests}
            roomCount={roomCount}
          />
        </Suspense>
      </main>
    </div>
  )
}
