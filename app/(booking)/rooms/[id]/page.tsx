import { notFound } from 'next/navigation'
import { Users, Maximize2, Star } from 'lucide-react'
import { ImageGallery } from '@/components/room-card/ImageGallery'
import { RoomDetailCartPanel } from '@/components/checkout/RoomDetailCartPanel'
import { StepRail } from '@/components/booking-steps/StepRail'
import { readRoomById, readAvailabilityByRoomId } from '@/lib/utils/data'
import { formatCurrency } from '@/lib/utils/dates'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ checkIn?: string; checkOut?: string; guests?: string }>
}

const roomTypeLabels: Record<string, string> = {
  single: 'Single Room',
  double: 'Double Room',
  room: 'Encore Room',
  suite: 'Encore Suite',
  deluxe: 'Deluxe Suite',
  penthouse: 'Penthouse Suite',
}

const amenityIcons: Record<string, string> = {
  'Free Wi-Fi': '📶',
  'Air Conditioning': '❄️',
  'Flat-screen TV': '📺',
  'Mini-fridge': '🧊',
  Safe: '🔒',
  'Mini-bar': '🍸',
  'Coffee Machine': '☕',
  'Bathrobe & Slippers': '🛁',
  'Nespresso Machine': '☕',
  'Soaking Tub': '🛁',
  'Panoramic View': '🌆',
  'Butler Service': '🎩',
  'Airport Transfer Included': '✈️',
  'Private Terrace with Hot Tub': '🌊',
}

export default async function RoomDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const sp = await searchParams

  const room = readRoomById(id)
  if (!room) notFound()

  const availability = readAvailabilityByRoomId(id)

  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      {/* Step rail */}
      <StepRail currentStep={2} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Eyebrow */}
        <p className="mb-1 text-xs font-semibold tracking-[0.2em] text-[#3D2314] uppercase">
          {roomTypeLabels[room.type] ?? room.type}
        </p>

        {/* Room name */}
        <h1 className="mb-3 font-[family-name:var(--font-heading)] text-4xl font-semibold tracking-wide text-[#3D2314] md:text-5xl">
          {room.name}
        </h1>

        {/* Rating + capacity row */}
        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-[#7B5135]">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">4.9</span>
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Up to {room.maxGuests} {room.maxGuests === 1 ? 'guest' : 'guests'}
          </span>
          <span className="flex items-center gap-1">
            <Maximize2 className="h-4 w-4" />
            {room.size} sq ft
          </span>
          <span>Floor {room.floor}</span>
        </div>

        {/* Image Gallery — full width */}
        <div className="mb-10">
          <ImageGallery images={room.images} roomName={room.name} />
        </div>

        {/* 3-col grid: left content (2-col) | right panel (1-col sticky) */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* LEFT: room details */}
          <div className="space-y-8 lg:col-span-2">
            {/* About */}
            <section>
              <h2 className="mb-3 font-[family-name:var(--font-heading)] text-xl font-semibold text-[#3D2314]">
                About this suite
              </h2>
              <p className="leading-relaxed text-[#7B5135]">{room.description}</p>
            </section>

            {/* Amenities */}
            <section>
              <h2 className="mb-4 font-[family-name:var(--font-heading)] text-xl font-semibold text-[#3D2314]">
                Amenities
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {room.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-sm text-[#7B5135]">
                    <span className="text-base">{amenityIcons[amenity] ?? '✓'}</span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Pricing breakdown */}
            <section className="rounded-xl border border-[#E8D9C5] p-5">
              <h2 className="mb-3 font-[family-name:var(--font-heading)] text-xl font-semibold text-[#3D2314]">
                Pricing
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#7B5135]">Room rate</span>
                  <span className="font-medium text-[#3D2314]">
                    {formatCurrency(room.pricePerNight)} / night
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7B5135]">Breakfast add-on</span>
                  <span className="font-medium text-[#3D2314]">+$25 / night</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7B5135]">Airport transfer</span>
                  <span className="font-medium text-[#3D2314]">+$75 one-time</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7B5135]">Late checkout</span>
                  <span className="font-medium text-[#3D2314]">+$50 one-time</span>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: sticky cart panel */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <RoomDetailCartPanel
                room={room}
                availability={availability}
                initialCheckIn={sp.checkIn}
                initialCheckOut={sp.checkOut}
                initialGuests={sp.guests ? parseInt(sp.guests) : undefined}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
