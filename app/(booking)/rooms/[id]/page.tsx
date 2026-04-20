import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Maximize2, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ImageGallery } from '@/components/room-card/ImageGallery'
import { RoomBookingPanel } from '@/components/checkout/RoomBookingPanel'
import { readRoomById, readAvailabilityByRoomId } from '@/lib/utils/data'
import { formatCurrency } from '@/lib/utils/dates'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ checkIn?: string; checkOut?: string; guests?: string }>
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
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-4">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
            aria-label="Back to rooms"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to rooms
          </Link>
        </div>

        {/* Title section — above the gallery */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {room.type}
            </Badge>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">4.9</span>
            </div>
          </div>
          <h1 className="mb-3 text-3xl font-bold">{room.name}</h1>
          <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
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
        </div>

        {/* Image Gallery */}
        <div className="mb-10">
          <ImageGallery images={room.images} roomName={room.name} />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Room details */}
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="mb-8">
              <h2 className="mb-3 text-lg font-semibold">About this room</h2>
              <p className="text-muted-foreground leading-relaxed">{room.description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-semibold">Amenities</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {room.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-sm">
                    <span className="text-base">{amenityIcons[amenity] ?? '✓'}</span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing breakdown */}
            <div className="rounded-xl border p-5">
              <h2 className="mb-3 text-lg font-semibold">Pricing</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room rate</span>
                  <span className="font-medium">{formatCurrency(room.pricePerNight)} / night</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Breakfast add-on</span>
                  <span className="font-medium">+$25 / night</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Airport transfer</span>
                  <span className="font-medium">+$75 one-time</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Late checkout</span>
                  <span className="font-medium">+$50 one-time</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Booking panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-36">
              <RoomBookingPanel
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
