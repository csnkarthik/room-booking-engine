'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import dynamic from 'next/dynamic'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBookingStore } from '@/lib/store/bookingStore'
import { GuestSchema } from '@/lib/types/schemas'
import { daysBetween } from '@/lib/utils/dates'
import type { User } from '@auth0/nextjs-auth0/types'

// @mapbox/search-js-react accesses `document` at module evaluation time, which
// crashes SSR. Load it only on the client.
const AddressAutofill = dynamic(
  () => import('@/components/checkout/AddressAutofill').then((m) => m.AddressAutofill),
  { ssr: false, loading: () => <Input placeholder="123 Main St" disabled /> }
)

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PL', name: 'Poland' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TH', name: 'Thailand' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'IL', name: 'Israel' },
  { code: 'RU', name: 'Russia' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'GR', name: 'Greece' },
  { code: 'CZ', name: 'Czech Republic' },
]

type GuestFormValues = z.infer<typeof GuestSchema>

interface CheckoutFormProps {
  user?: User | null
  onProcessingChange?: (processing: boolean) => void
  onPaymentReady?: () => void
}

export function CheckoutForm({ user, onProcessingChange, onPaymentReady }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { cartItems, clearCart } = useBookingStore()
  const [paymentElementReady, setPaymentElementReady] = useState(false)

  function updateProcessing(value: boolean) {
    onProcessingChange?.(value)
  }

  function handlePaymentReady() {
    setPaymentElementReady(true)
    onPaymentReady?.()
  }

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
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

  const grandTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0)

  const onSubmit = async (guestData: GuestFormValues) => {
    if (!stripe || !elements || cartItems.length === 0) return

    updateProcessing(true)

    try {
      // Step 1: validate payment element fields
      const { error: submitError } = await elements.submit()
      if (submitError) {
        toast.error(submitError.message ?? 'Payment validation failed.')
        updateProcessing(false)
        return
      }

      // Step 2: create PaymentIntent on the server
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal,
          currency: 'usd',
          metadata: {
            rooms: cartItems.map((i) => i.room.name).join(', '),
            roomCount: String(cartItems.length),
            checkIn: cartItems[0]?.checkIn,
            checkOut: cartItems[0]?.checkOut,
          },
        }),
      })
      const paymentData = await res.json()
      if (!paymentData.clientSecret) {
        toast.error('Failed to initialize payment. Please try again.')
        updateProcessing(false)
        return
      }

      // Step 3: confirm payment with the clientSecret
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: paymentData.clientSecret,
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

      if (paymentIntent?.status === 'requires_capture') {
        // Payment authorized (funds held). Now attempt Opera reservations before capturing.
        const reservationIds: string[] = []
        for (const item of cartItems) {
          let operaRes: Response
          try {
            operaRes = await fetch('/api/opera/reservation', {
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
          } catch (err) {
            console.error('[CheckoutForm] Opera reservation network error:', err)
            // Cancel the auth hold — nothing was charged
            await fetch(`/api/payments/${paymentIntent.id}/cancel`, { method: 'POST' })
            toast.error(
              `Unable to complete your reservation for "${item.room.name}". Your card was not charged.`
            )
            updateProcessing(false)
            return
          }

          if (!operaRes.ok) {
            const errText = await operaRes.text()
            console.error('[CheckoutForm] Opera reservation failed:', errText)
            // Cancel the auth hold — nothing was charged
            await fetch(`/api/payments/${paymentIntent.id}/cancel`, { method: 'POST' })
            toast.error(
              `"${item.room.name}" is no longer available for your selected dates. Your card was not charged.`
            )
            updateProcessing(false)
            return
          }

          const data = await operaRes.json()
          if (data.operaReservationId) reservationIds.push(data.operaReservationId)
        }

        // All reservations secured — capture the payment
        const captureRes = await fetch(`/api/payments/${paymentIntent.id}/capture`, {
          method: 'POST',
        })
        if (!captureRes.ok) {
          console.error('[CheckoutForm] Payment capture failed')
          toast.error('Payment capture failed. Please contact support — your reservation is held.')
          updateProcessing(false)
          return
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
      <div className="rounded-2xl border border-[#D8D8D8] bg-white p-6">
        <h2 className="mb-4 text-lg">Guest Information</h2>
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
            <AddressAutofill
              id="addressLine1"
              value={watch('addressLine1') ?? ''}
              onChange={(v) => setValue('addressLine1', v, { shouldValidate: true })}
              onBlur={() => {}}
              hasError={!!errors.addressLine1}
              onSelect={(s) => {
                setValue('city', s.city, { shouldValidate: true })
                setValue('state', s.state, { shouldValidate: true })
                setValue('postalCode', s.zip_code, { shouldValidate: true })
                setValue('countryCode', 'US', { shouldValidate: true })
              }}
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
          <div className="w-full">
            <label htmlFor="countryCode" className="mb-1 block text-sm font-medium">
              Country{' '}
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </label>
            <Controller
              name="countryCode"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="countryCode" aria-invalid={!!errors.countryCode}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
      <div className="rounded-2xl border border-[#D8D8D8] bg-white p-6">
        <h2 className="mb-4 text-lg">Payment Details</h2>
        <div className="relative">
          {/* Skeleton shown while PaymentElement iframe loads */}
          {!paymentElementReady && (
            <div className="animate-pulse space-y-3">
              <div className="h-10 rounded-lg bg-gray-100" />
              <div className="h-10 rounded-lg bg-gray-100" />
              <div className="h-36 rounded-lg bg-gray-100" />
            </div>
          )}
          {/* PaymentElement kept in DOM from the start so the iframe loads in background */}
          <div
            className="transition-opacity duration-500"
            style={
              paymentElementReady
                ? { opacity: 1 }
                : { opacity: 0, position: 'absolute', inset: 0, pointerEvents: 'none' }
            }
          >
            <PaymentElement
              options={{ layout: 'tabs', wallets: { link: 'never' } }}
              onReady={handlePaymentReady}
            />
          </div>
        </div>
        <p className="text-muted-foreground mt-3 text-xs">
          Test card: <code className="bg-muted rounded px-1 py-0.5">4242 4242 4242 4242</code> — any
          future date, any CVC
        </p>
      </div>
    </form>
  )
}
