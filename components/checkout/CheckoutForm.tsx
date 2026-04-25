'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBookingStore } from '@/lib/store/bookingStore'
import { GuestSchema } from '@/lib/types/schemas'
import { daysBetween } from '@/lib/utils/dates'

type GuestFormValues = z.infer<typeof GuestSchema>

interface CheckoutFormProps {
  grandTotal: number
}

export function CheckoutForm({ grandTotal }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { cartItems, extras, setExtras, clearCart } = useBookingStore()

  // Total nights across all cart items (for breakfast pricing)
  const totalNights = cartItems.reduce(
    (sum, item) => sum + daysBetween(item.checkIn, item.checkOut),
    0
  )
  const extrasTotal =
    (extras.breakfast ? 25 * totalNights : 0) +
    (extras.airportTransfer ? 75 : 0) +
    (extras.lateCheckout ? 50 : 0)
  const totalWithExtras = grandTotal + extrasTotal

  const [processing, setProcessing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(GuestSchema),
    defaultValues: { countryCode: 'US' },
  })

  const onSubmit = async (guestData: GuestFormValues) => {
    if (!stripe || !elements || cartItems.length === 0) return

    setProcessing(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation`,
        },
        redirect: 'if_required',
      })

      if (error) {
        toast.error(error.message ?? 'Payment failed. Please try again.')
        setProcessing(false)
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        // Best-effort: create one Opera reservation per cart item
        const reservationIds: string[] = []
        for (const item of cartItems) {
          try {
            const operaRes = await fetch('/api/opera/reservation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roomId: item.room.id,
                checkIn: item.checkIn,
                checkOut: item.checkOut,
                adults: item.guests,
                totalPrice: item.totalPrice + extrasTotal,
                guest: guestData,
              }),
            })
            if (operaRes.ok) {
              const data = await operaRes.json()
              if (data.operaReservationId) reservationIds.push(data.operaReservationId)
            } else {
              console.error('[CheckoutForm] Opera reservation failed:', await operaRes.text())
            }
          } catch (err) {
            console.error('[CheckoutForm] Opera reservation error:', err)
          }
        }

        toast.success('Payment successful! Your booking is confirmed.')
        clearCart()

        if (reservationIds.length > 0) {
          router.push(`/confirmation?reservationIds=${reservationIds.join(',')}`)
        } else {
          router.push(`/confirmation?paymentIntentId=${paymentIntent.id}`)
        }
      }
    } catch (err) {
      console.error('[CheckoutForm] Unexpected error during submission:', err)
      toast.error('An unexpected error occurred. Please try again.')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Guest Info */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Guest Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-1 block text-sm font-medium">
              First Name{' '}
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </label>
            <Input
              id="firstName"
              {...register('firstName')}
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              placeholder="John"
            />
            {errors.firstName && (
              <p id="firstName-error" className="text-destructive mt-1 text-xs" role="alert">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1 block text-sm font-medium">
              Last Name{' '}
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </label>
            <Input
              id="lastName"
              {...register('lastName')}
              aria-invalid={!!errors.lastName}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-destructive mt-1 text-xs" role="alert">
                {errors.lastName.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email{' '}
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              aria-invalid={!!errors.email}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-destructive mt-1 text-xs" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium">
              Phone{' '}
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              aria-invalid={!!errors.phone}
              placeholder="+1 (555) 000-0000"
            />
            {errors.phone && (
              <p className="text-destructive mt-1 text-xs" role="alert">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="mt-4 grid gap-4">
          <div>
            <label htmlFor="addressLine1" className="mb-1 block text-sm font-medium">
              Address{' '}
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </label>
            <Input
              id="addressLine1"
              {...register('addressLine1')}
              aria-invalid={!!errors.addressLine1}
              placeholder="123 Main St"
            />
            {errors.addressLine1 && (
              <p className="text-destructive mt-1 text-xs" role="alert">
                {errors.addressLine1.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="addressLine2" className="mb-1 block text-sm font-medium">
              Address Line 2
            </label>
            <Input
              id="addressLine2"
              {...register('addressLine2')}
              placeholder="Apt, suite, unit (optional)"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label htmlFor="city" className="mb-1 block text-sm font-medium">
                City{' '}
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </label>
              <Input
                id="city"
                {...register('city')}
                aria-invalid={!!errors.city}
                placeholder="New York"
              />
              {errors.city && (
                <p className="text-destructive mt-1 text-xs" role="alert">
                  {errors.city.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="state" className="mb-1 block text-sm font-medium">
                State{' '}
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </label>
              <Input
                id="state"
                {...register('state')}
                aria-invalid={!!errors.state}
                placeholder="NY"
              />
              {errors.state && (
                <p className="text-destructive mt-1 text-xs" role="alert">
                  {errors.state.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="postalCode" className="mb-1 block text-sm font-medium">
                Postal Code{' '}
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </label>
              <Input
                id="postalCode"
                {...register('postalCode')}
                aria-invalid={!!errors.postalCode}
                placeholder="10001"
              />
              {errors.postalCode && (
                <p className="text-destructive mt-1 text-xs" role="alert">
                  {errors.postalCode.message}
                </p>
              )}
            </div>
          </div>
          <div className="sm:w-1/4">
            <label htmlFor="countryCode" className="mb-1 block text-sm font-medium">
              Country{' '}
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </label>
            <Input
              id="countryCode"
              {...register('countryCode')}
              aria-invalid={!!errors.countryCode}
              placeholder="US"
              maxLength={2}
            />
            {errors.countryCode && (
              <p className="text-destructive mt-1 text-xs" role="alert">
                {errors.countryCode.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add-ons */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Add-ons</h2>
        <div className="space-y-3">
          {[
            { key: 'breakfast', label: 'Breakfast', price: `+$25/night (${totalNights} nights)` },
            { key: 'airportTransfer', label: 'Airport Transfer', price: '+$75 one-time' },
            { key: 'lateCheckout', label: 'Late Checkout (until 2pm)', price: '+$50 one-time' },
          ].map(({ key, label, price }) => (
            <label
              key={key}
              className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-xl border p-3"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={extras[key as keyof typeof extras]}
                  onChange={(e) => setExtras({ [key]: e.target.checked })}
                  className="accent-primary h-4 w-4 rounded"
                  aria-label={label}
                />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <span className="text-muted-foreground text-xs">{price}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Payment Details</h2>
        <PaymentElement
          options={{
            layout: 'tabs',
            wallets: { link: 'never' },
          }}
        />
        <p className="text-muted-foreground mt-3 text-xs">
          Test card: <code className="bg-muted rounded px-1 py-0.5">4242 4242 4242 4242</code> — any
          future date, any CVC
        </p>
      </div>

      <Button type="submit" disabled={!stripe || processing} size="lg" className="w-full">
        {processing ? 'Processing...' : `Pay $${totalWithExtras.toFixed(2)} & Confirm`}
      </Button>
    </form>
  )
}
