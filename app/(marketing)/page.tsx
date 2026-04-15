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
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white px-4 py-5">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold text-slate-900">Wynn Las Vegas</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Premium hotel rooms &amp; suites</p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="bg-muted h-14 w-full animate-pulse rounded-2xl" />
              <div className="flex gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-muted h-8 w-20 animate-pulse rounded-full" />
                ))}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-muted aspect-[4/5] animate-pulse rounded-2xl" />
                ))}
              </div>
            </div>
          }
        >
          <RoomsSection />
        </Suspense>
      </div>
    </main>
  )
}
