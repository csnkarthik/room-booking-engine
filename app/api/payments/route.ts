import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'

let stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    stripe = new Stripe(key)
  }
  return stripe
}

const PaymentIntentSchema = z.object({
  amount: z.number().positive(), // in dollars
  currency: z.string().default('usd'),
  metadata: z.record(z.string(), z.string()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = PaymentIntentSchema.safeParse(body)

    if (!parsed.success) {
      console.error(
        '[/api/payments] Validation error:',
        JSON.stringify(parsed.error.flatten(), null, 2)
      )
      return NextResponse.json({ error: 'Invalid payment data' }, { status: 400 })
    }

    const { amount, currency, metadata } = parsed.data

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: metadata ?? {},
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
}
