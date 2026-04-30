'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useBookingStore } from '@/lib/store/bookingStore'

export function CartBadge() {
  const count = useBookingStore((s) => s.cartItems.length)

  return (
    <Link
      href="/cart"
      aria-label={`View cart${count > 0 ? ` — ${count} room${count !== 1 ? 's' : ''}` : ''}`}
      className="relative inline-flex items-center gap-1.5 text-[11px] font-black tracking-[1.5px] text-white/80 uppercase transition-colors hover:text-[#DDBE77]"
    >
      <span>CART</span>
      <ShoppingCart className="h-4 w-4 -mt-2" />
      {count > 0 && (
        <span className="absolute -top-3 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#006F62] text-[9px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  )
}
