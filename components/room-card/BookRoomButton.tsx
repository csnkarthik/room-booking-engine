'use client'

import { useRouter } from 'next/navigation'
import { useBookingStore } from '@/lib/store/bookingStore'
import { calculateStayPrice } from '@/lib/utils/pricing'
import { cn } from '@/lib/utils'
import type { Room } from '@/lib/types'

function isoDate(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

interface BookRoomButtonProps {
  room: Room
  className?: string
}

const noExtras = { breakfast: false, airportTransfer: false, lateCheckout: false }

export function BookRoomButton({ room, className }: BookRoomButtonProps) {
  const router = useRouter()
  const { checkIn, checkOut, guests, rooms, addToCart } = useBookingStore()

  const handleClick = () => {
    const effectiveCI = checkIn ?? isoDate(1)
    const effectiveCO = checkOut ?? isoDate(4)

    const count = Math.max(1, rooms)
    for (let i = 0; i < count; i++) {
      const price = calculateStayPrice(room.pricePerNight, effectiveCI, effectiveCO, noExtras)
      addToCart({
        room,
        checkIn: effectiveCI,
        checkOut: effectiveCO,
        guests: guests > 0 ? guests : 1,
        extras: noExtras,
        totalPrice: price,
      })
    }

    router.push('/cart')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'shrink-0 cursor-pointer bg-[#006F62] px-5 py-2.5 text-[11px] font-black tracking-[1.5px] text-white uppercase',
        'transition-colors hover:bg-[#008475]',
        className
      )}
    >
      Book Room
    </button>
  )
}
