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
  const { room, checkIn, checkOut, guests, extras, totalPrice } = useBookingStore()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  // Capture booking validity at mount time — not reactive to store being cleared after payment
  const [hasBooking] = useState(() => !!room && !!checkIn && !!checkOut)

  useEffect(() => {
    if (!hasBooking) {
      router.replace('/rooms')
      return
    }

    fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: totalPrice || room!.pricePerNight,
        currency: 'usd',
        metadata: {
          roomId: room!.id,
          roomName: room!.name,
          checkIn,
          checkOut,
          guests: String(guests),
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- intentionally runs once on mount

  if (!hasBooking) return null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <Link
            href={room ? `/rooms/${room.id}` : '/rooms'}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to room
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Complete Your Booking</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
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
                <CheckoutForm clientSecret={clientSecret} />
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
