'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { useBookingStore } from '@/lib/store/bookingStore'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { BookingSummary } from '@/components/checkout/BookingSummary'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems } = useBookingStore()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasCart] = useState(() => cartItems.length > 0)

  const grandTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0)

  useEffect(() => {
    if (!hasCart) {
      router.replace('/rooms')
      return
    }

    const roomNames = cartItems.map((i) => i.room.name).join(', ')

    fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: grandTotal,
        currency: 'usd',
        metadata: {
          rooms: roomNames,
          roomCount: String(cartItems.length),
          checkIn: cartItems[0]?.checkIn,
          checkOut: cartItems[0]?.checkOut,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!hasCart) return null

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <Link
            href="/cart"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </Link>
          <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-wide">
            Complete Your Booking
          </h1>
        </div>
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Checkout form - 3 cols */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-muted h-16 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: { colorPrimary: '#0f172a' },
                  },
                }}
              >
                <CheckoutForm grandTotal={grandTotal} />
              </Elements>
            ) : (
              <div className="border-destructive/50 bg-destructive/10 rounded-xl border p-6 text-center">
                <p className="text-destructive text-sm">
                  Failed to initialize payment. Please go back and try again.
                </p>
              </div>
            )}
          </div>

          {/* Booking summary - 2 cols */}
          <div className="lg:col-span-2">
            <BookingSummary />
          </div>
        </div>
      </main>
    </div>
  )
}
