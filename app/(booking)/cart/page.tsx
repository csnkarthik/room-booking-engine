'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBookingStore } from '@/lib/store/bookingStore'

export default function CartPage() {
  const router = useRouter()
  const cartItems = useBookingStore((s) => s.cartItems)
  const [hydrated, setHydrated] = useState(() => useBookingStore.persist.hasHydrated())

  useEffect(() => {
    // Wait for Zustand persist to hydrate from localStorage
    const unsub = useBookingStore.persist.onFinishHydration(() => setHydrated(true))
    return unsub
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (cartItems.length > 0) {
      router.replace(`/rooms/${cartItems[0].room.id}`)
    } else {
      router.replace('/rooms')
    }
  }, [hydrated, cartItems, router])

  return null
}
