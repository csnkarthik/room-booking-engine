import Link from 'next/link'
import Image from 'next/image'
import { Users, Maximize2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
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

  // Calculate number of nights
  let nights = 0
  if (hasDates) {
    const start = new Date(checkIn + 'T00:00:00')
    const end = new Date(checkOut + 'T00:00:00')
    nights = Math.round((end.getTime() - start.getTime()) / 86400000)
  }

  return (
    <Card className="group overflow-hidden border-[#E8D9C5] pt-0 transition-shadow hover:shadow-xl">
      <div className="bg-muted relative aspect-[4/3] overflow-hidden">
        <Image
          src={room.images[0]}
          alt={room.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <Badge className="absolute top-3 left-3 rounded-none border-0 bg-[#3D2314] px-2 py-0.5 text-[10px] tracking-widest text-[#C8B89A] uppercase">
          {roomTypeLabels[room.type] ?? room.type}
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-[family-name:var(--font-heading)] text-lg leading-tight font-semibold tracking-wide">
            {room.name}
          </h3>
          <div className="shrink-0 text-right">
            {apiPricePerNight ? (
              <>
                <div className="text-primary text-lg font-bold">
                  {formatCurrency(apiPricePerNight)}
                </div>
                <div className="text-muted-foreground text-xs">/night</div>
              </>
            ) : stayTotal ? (
              <>
                <div className="text-primary text-lg font-bold">{formatCurrency(stayTotal)}</div>
                <div className="text-muted-foreground text-xs">
                  {nights} night{nights > 1 ? 's' : ''} total
                </div>
              </>
            ) : (
              <>
                <span className="text-primary text-lg font-bold">
                  {formatCurrency(room.pricePerNight)}
                </span>
                <span className="text-muted-foreground text-xs"> /night</span>
              </>
            )}
          </div>
        </div>

        <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">{room.description}</p>

        <div className="text-muted-foreground mb-4 flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Up to {room.maxGuests} {room.maxGuests === 1 ? 'guest' : 'guests'}
          </span>
          <span className="flex items-center gap-1">
            <Maximize2 className="h-3 w-3" />
            {room.size} sq ft
          </span>
        </div>

        <div className="mb-4 flex flex-wrap gap-1">
          {room.amenities.slice(0, 3).map((amenity) => (
            <Badge
              key={amenity}
              variant="outline"
              className="rounded-none border-[#E8D9C5] text-[10px] tracking-wider text-[#7B5135] uppercase"
            >
              {amenity}
            </Badge>
          ))}
          {room.amenities.length > 3 && (
            <Badge
              variant="outline"
              className="rounded-none border-[#E8D9C5] text-[10px] tracking-wider text-[#7B5135] uppercase"
            >
              +{room.amenities.length - 3} more
            </Badge>
          )}
        </div>

        <Link
          href={`/rooms/${room.id}${query ? `?${query}` : ''}`}
          className={cn(buttonVariants(), 'w-full rounded-none text-xs tracking-widest uppercase')}
        >
          View Room
        </Link>
      </CardContent>
    </Card>
  )
}
