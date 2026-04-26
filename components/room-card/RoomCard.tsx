import Link from 'next/link'
import Image from 'next/image'
import { Users, Maximize2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/dates'
import { calculateStayPrice } from '@/lib/utils/pricing'
import { cn } from '@/lib/utils'
import type { Room } from '@/lib/types'

interface RoomCardProps {
  room: Room
  checkIn?: string | null
  checkOut?: string | null
  guests?: number
  apiPricePerNight?: number
}

const roomTypeLabels: Record<string, string> = {
  single: 'Single',
  double: 'Double',
  suite: 'Suite',
  deluxe: 'Deluxe',
  penthouse: 'Penthouse',
  room: 'Resort Room',
}

const noExtras = { breakfast: false, airportTransfer: false, lateCheckout: false }

export function RoomCard({ room, checkIn, checkOut, guests, apiPricePerNight }: RoomCardProps) {
  const params = new URLSearchParams()
  if (checkIn) params.set('checkIn', checkIn)
  if (checkOut) params.set('checkOut', checkOut)
  if (guests) params.set('guests', String(guests))
  const query = params.toString()

  const hasDates = checkIn && checkOut
  const stayTotal = hasDates
    ? calculateStayPrice(room.pricePerNight, checkIn, checkOut, noExtras)
    : null

  let nights = 0
  if (hasDates) {
    const start = new Date(checkIn + 'T00:00:00')
    const end = new Date(checkOut + 'T00:00:00')
    nights = Math.round((end.getTime() - start.getTime()) / 86400000)
  }

  const displayPrice = apiPricePerNight ?? (stayTotal ? stayTotal : room.pricePerNight)
  const priceLabel = apiPricePerNight
    ? '/night'
    : stayTotal
      ? `${nights} night${nights > 1 ? 's' : ''} total`
      : '/night'

  return (
    <div className="group overflow-hidden border border-[#D8D8D8] bg-white transition-shadow hover:shadow-xl">
      {/* Image with concave bottom curve */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={room.images[0]}
          alt={room.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Room type badge — top left */}
        <div className="absolute top-3 left-3 z-10 bg-[#5A3A27]/80 px-2 py-1 text-[10px] font-black tracking-[1.5px] text-white/90 uppercase backdrop-blur-sm">
          {roomTypeLabels[room.type] ?? room.type}
        </div>
        {/* Concave bottom curve: white ellipse clipped by overflow-hidden */}
        <div
          className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 rounded-full bg-white"
          style={{ width: 'calc(100% + 64px)', height: '48px', bottom: '-24px' }}
        />
      </div>

      {/* Card content */}
      <div className="px-5 pt-2 pb-5">
        {/* Room name */}
        <h3 className="mb-1 font-[family-name:var(--font-heading)] text-xl leading-snug font-medium tracking-wide text-[#101010]">
          {room.name}
        </h3>

        {/* Description */}
        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-[#626262]">
          {room.description}
        </p>

        {/* Meta */}
        <div className="mb-3 flex items-center gap-4 text-xs text-[#8D8D8D]">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Up to {room.maxGuests} {room.maxGuests === 1 ? 'guest' : 'guests'}
          </span>
          <span className="flex items-center gap-1">
            <Maximize2 className="h-3 w-3" />
            {room.size} sq ft
          </span>
        </div>

        {/* Amenity badges */}
        <div className="mb-4 flex flex-wrap gap-1">
          {room.amenities.slice(0, 3).map((amenity) => (
            <Badge
              key={amenity}
              variant="outline"
              className="rounded-none border-[#D8D8D8] text-[10px] tracking-wider text-[#5A3A27] uppercase"
            >
              {amenity}
            </Badge>
          ))}
          {room.amenities.length > 3 && (
            <Badge
              variant="outline"
              className="rounded-none border-[#D8D8D8] text-[10px] tracking-wider text-[#5A3A27] uppercase"
            >
              +{room.amenities.length - 3} more
            </Badge>
          )}
        </div>

        {/* Divider */}
        <div className="mb-4 border-t border-[#D8D8D8]" />

        {/* Price + CTA row */}
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-[#101010]">{formatCurrency(displayPrice)}</div>
            <div className="text-xs text-[#8D8D8D] italic">Excludes Taxes.</div>
            <div className="text-[10px] text-[#8D8D8D]">{priceLabel}</div>
          </div>

          <Link
            href={`/rooms/${room.id}${query ? `?${query}` : ''}`}
            className={cn(
              'shrink-0 bg-[#006F62] px-5 py-2.5 text-[11px] font-black tracking-[1.5px] text-white uppercase',
              'transition-colors hover:bg-[#008475]'
            )}
          >
            View Rates
          </Link>
        </div>

        {/* Special rates */}
        <p className="mt-3 text-center text-[10px] tracking-wider text-[#8D8D8D]">
          Special Rates Available
        </p>
      </div>
    </div>
  )
}
