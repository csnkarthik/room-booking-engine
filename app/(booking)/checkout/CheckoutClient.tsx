'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { useBookingStore } from '@/lib/store/bookingStore'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { BookingStepNav } from '@/components/booking/BookingStepNav'
import { OrderSummaryPanel } from '@/components/booking/OrderSummaryPanel'
import { daysBetween } from '@/lib/utils/dates'
import type { User } from '@auth0/nextjs-auth0/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutClientProps {
  user: User | null
}

export function CheckoutClient({ user }: CheckoutClientProps) {
  const router = useRouter()
  const { cartItems } = useBookingStore()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [hasCart] = useState(() => cartItems.length > 0)

  const grandTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const extrasTotal = cartItems.reduce((sum, item) => {
    const nights = daysBetween(item.checkIn, item.checkOut)
    return (
      sum +
      (item.extras.breakfast ? 25 * nights : 0) +
      (item.extras.airportTransfer ? 75 : 0) +
      (item.extras.lateCheckout ? 50 : 0)
    )
  }, 0)
  const totalWithExtras = grandTotal + extrasTotal

  useEffect(() => {
    if (!hasCart) {
      router.replace('/')
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

  const stripeReady = !loading && !!clientSecret

  return (
    <div className="min-h-screen bg-white">
      <BookingStepNav currentStep={2} />

      <main className="mx-auto max-w-[1440px] px-4 py-8 pb-28 sm:px-6 lg:px-12 lg:pb-8">
        <h1 className="mb-6 font-[family-name:var(--font-heading)] text-3xl font-medium tracking-wide text-[#101010]">
          Complete Your Booking
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout form */}
          <div className="lg:col-span-2">
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
                <CheckoutForm user={user} onProcessingChange={setProcessing} />
              </Elements>
            ) : (
              <div className="border-destructive/50 bg-destructive/10 rounded-xl border p-6 text-center">
                <p className="text-destructive text-sm">
                  Failed to initialize payment. Please go back and try again.
                </p>
              </div>
            )}
          </div>

          {/* Order summary + Pay button */}
          <div className="lg:col-span-1">
            <div className="space-y-3 lg:sticky lg:top-20">
              <OrderSummaryPanel />
              <button
                type="submit"
                form="checkout-form"
                disabled={!stripeReady || processing}
                className="hidden w-full bg-[#006F62] py-4 text-[11px] font-black tracking-[1.5px] text-white uppercase transition-colors hover:bg-[#008475] disabled:cursor-not-allowed disabled:opacity-50 lg:block"
              >
                {processing ? 'Processing…' : `Pay $${totalWithExtras.toFixed(2)} & Confirm`}
              </button>
              <p className="text-center text-[10px] tracking-wider text-[#8D8D8D]">
                You won&apos;t be charged until you confirm
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile sticky pay footer — hidden on lg */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D8D8D8] bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] lg:hidden">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[1.5px] text-[#8D8D8D] uppercase">
            Total
          </span>
          <span className="text-base font-bold text-[#006F62]">${totalWithExtras.toFixed(2)}</span>
        </div>
        <button
          type="submit"
          form="checkout-form"
          disabled={!stripeReady || processing}
          className="flex w-full items-center justify-center gap-2 bg-[#006F62] py-3.5 text-[11px] font-black tracking-[1.5px] text-white uppercase transition-colors active:bg-[#008475] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing ? 'Processing…' : `Pay $${totalWithExtras.toFixed(2)} & Confirm`}
        </button>
      </div>
    </div>
  )
}
