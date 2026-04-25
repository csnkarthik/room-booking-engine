'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useBookingStore } from '@/lib/store/bookingStore'

export function CartBadge() {
  const count = useBookingStore((s) => s.cartItems.length)

  if (count === 0) return null

  return (
    <Link
      href="/cart"
      aria-label={`View cart — ${count} room${count !== 1 ? 's' : ''}`}
      className="absolute top-3 right-4 flex items-center gap-1.5 rounded-full bg-[#C8B89A] px-3 py-1 text-xs font-semibold text-[#3D2314] transition-opacity hover:opacity-90"
    >
      <ShoppingCart className="h-3.5 w-3.5" />
      <span>{count}</span>
    </Link>
  )
}
