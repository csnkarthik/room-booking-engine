import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

let stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    stripe = new Stripe(key)
  }
  return stripe
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const paymentIntent = await getStripe().paymentIntents.capture(id)
    return NextResponse.json({ status: paymentIntent.status })
  } catch (err) {
    console.error('[/api/payments/[id]/capture] Error:', err)
    return NextResponse.json({ error: 'Failed to capture payment' }, { status: 500 })
  }
}
