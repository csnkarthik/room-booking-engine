import { Suspense } from 'react'
import { readRooms } from '@/lib/utils/data'
import { HomeRoomsSection } from '@/components/room-card/HomeRoomsSection'

async function RoomsSection() {
  const rooms = readRooms().filter((r) => r.available)
  const minPrice = Math.min(...rooms.map((r) => r.pricePerNight))
  return <HomeRoomsSection rooms={rooms} minPrice={minPrice} />
}

export default function HomePage() {
  return (
    <main className="bg-background min-h-screen">
      <Suspense
        fallback={
          <div className="mx-auto max-w-[1140px] px-4 py-10 sm:px-6 lg:px-12">
            <div className="space-y-6">
              <div className="bg-muted h-14 w-full animate-pulse" />
              <div className="flex gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-muted h-8 w-20 animate-pulse rounded-full" />
                ))}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-muted aspect-[4/5] animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        }
      >
        <RoomsSection />
      </Suspense>
    </main>
  )
}
