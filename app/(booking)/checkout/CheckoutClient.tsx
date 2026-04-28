'use client'

import { useState, useEffect } from 'react'
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
  const [processing, setProcessing] = useState(false)
  const [paymentReady, setPaymentReady] = useState(false)
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
    }
  }, [hasCart, router])

  if (!hasCart) return null

  return (
    <div className="min-h-screen bg-white">
      <BookingStepNav currentStep={2} />

      <main className="mx-auto max-w-[1440px] px-4 py-8 pb-28 sm:px-6 md:pb-8 lg:px-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Checkout form — renders immediately, no PaymentIntent waterfall */}
          <div className="md:col-span-2">
            <Elements
              stripe={stripePromise}
              options={{
                mode: 'payment',
                amount: Math.round(grandTotal * 100),
                currency: 'usd',
                appearance: {
                  theme: 'stripe',
                  variables: { colorPrimary: '#0f172a' },
                },
              }}
            >
              <CheckoutForm
                user={user}
                onProcessingChange={setProcessing}
                onPaymentReady={() => setPaymentReady(true)}
              />
            </Elements>
          </div>

          {/* Order summary + Pay button */}
          <div className="md:col-span-1">
            <div className="space-y-3 md:sticky md:top-20">
              <OrderSummaryPanel />
              <button
                type="submit"
                form="checkout-form"
                disabled={!paymentReady || processing}
                className="hidden w-full bg-[#006F62] py-4 text-[11px] font-black tracking-[1.5px] text-white uppercase transition-colors hover:bg-[#008475] disabled:cursor-not-allowed disabled:opacity-50 md:block"
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

      {/* Mobile sticky pay footer — hidden on md+ */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D8D8D8] bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:hidden">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[1.5px] text-[#8D8D8D] uppercase">
            Total
          </span>
          <span className="text-base font-bold text-[#006F62]">${totalWithExtras.toFixed(2)}</span>
        </div>
        <button
          type="submit"
          form="checkout-form"
          disabled={!paymentReady || processing}
          className="flex w-full items-center justify-center gap-2 bg-[#006F62] py-3.5 text-[11px] font-black tracking-[1.5px] text-white uppercase transition-colors active:bg-[#008475] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing ? 'Processing…' : `Pay $${totalWithExtras.toFixed(2)} & Confirm`}
        </button>
      </div>
    </div>
  )
}
