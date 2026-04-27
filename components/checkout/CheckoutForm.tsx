'use client'

import { useRouter } from 'next/navigation'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { useBookingStore } from '@/lib/store/bookingStore'
import { GuestSchema } from '@/lib/types/schemas'
import { daysBetween } from '@/lib/utils/dates'
import type { User } from '@auth0/nextjs-auth0/types'

type GuestFormValues = z.infer<typeof GuestSchema>

interface CheckoutFormProps {
  user?: User | null
  onProcessingChange?: (processing: boolean) => void
}

export function CheckoutForm({ user, onProcessingChange }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { cartItems, clearCart } = useBookingStore()

  function updateProcessing(value: boolean) {
    onProcessingChange?.(value)
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(GuestSchema),
    defaultValues: {
      countryCode: 'US',
      firstName: user?.given_name ?? '',
      lastName: user?.family_name ?? '',
      email: user?.email ?? '',
    },
  })

  const onSubmit = async (guestData: GuestFormValues) => {
    if (!stripe || !elements || cartItems.length === 0) return

    updateProcessing(true)

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
        updateProcessing(false)
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
                totalPrice:
                  item.totalPrice +
                  (item.extras.breakfast ? 25 * daysBetween(item.checkIn, item.checkOut) : 0) +
                  (item.extras.airportTransfer ? 75 : 0) +
                  (item.extras.lateCheckout ? 50 : 0),
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
      updateProcessing(false)
    }
  }

  return (
    <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
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
            <div className="sm:col-span-2 lg:col-span-2">
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
          <div className="w-full sm:w-auto sm:max-w-[120px]">
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
    </form>
  )
}
