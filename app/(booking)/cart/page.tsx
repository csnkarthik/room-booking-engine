'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, ArrowLeft, ShoppingCart, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBookingStore } from '@/lib/store/bookingStore'
import { formatCurrency, formatDisplayDate, daysBetween } from '@/lib/utils/dates'

export default function CartPage() {
  const router = useRouter()
  const { cartItems, removeFromCart } = useBookingStore()

  useEffect(() => {
    if (cartItems.length === 0) {
      router.replace('/rooms')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (cartItems.length === 0) return null

  const grandTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <Link
            href="/rooms"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to rooms
          </Link>
          <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-wide">
            Review Your Cart
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Cart items — 3 cols */}
          <div className="space-y-4 lg:col-span-3">
            {cartItems.map((item, index) => {
              const nights = daysBetween(item.checkIn, item.checkOut)
              return (
                <div key={index} className="rounded-2xl border bg-white p-5 shadow-sm">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={item.room.images[0]}
                        alt={item.room.name}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{item.room.name}</p>
                          <Badge variant="outline" className="mt-1 text-xs capitalize">
                            {item.room.type}
                          </Badge>
                        </div>
                        <button
                          onClick={() => removeFromCart(index)}
                          aria-label={`Remove ${item.room.name} from cart`}
                          className="text-muted-foreground hover:text-destructive shrink-0 rounded-lg p-1 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div>
                          <span className="text-muted-foreground">Check-in: </span>
                          <span className="font-medium">{formatDisplayDate(item.checkIn)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Check-out: </span>
                          <span className="font-medium">{formatDisplayDate(item.checkOut)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Guests: </span>
                          <span className="font-medium">{item.guests}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration: </span>
                          <span className="font-medium">
                            {nights} night{nights !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between border-t pt-3 text-sm font-semibold">
                        <span className="text-muted-foreground">
                          {formatCurrency(item.room.pricePerNight)} × {nights} night
                          {nights !== 1 ? 's' : ''}
                        </span>
                        <span className="text-primary">{formatCurrency(item.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            <Link
              href="/rooms"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Add another room
            </Link>
          </div>

          {/* Order summary — 2 cols */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Order Summary</h2>
              </div>

              <div className="space-y-3 text-sm">
                {cartItems.map((item, index) => {
                  const nights = daysBetween(item.checkIn, item.checkOut)
                  return (
                    <div key={index} className="flex justify-between">
                      <span className="text-muted-foreground truncate pr-2">
                        {item.room.name} × {nights}n
                      </span>
                      <span className="shrink-0 font-medium">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex justify-between border-t pt-4 text-base font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(grandTotal)}</span>
              </div>

              <Button className="mt-6 w-full" size="lg" onClick={() => router.push('/checkout')}>
                Proceed to Checkout
              </Button>

              <p className="text-muted-foreground mt-3 text-center text-xs">
                You won&apos;t be charged yet
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
