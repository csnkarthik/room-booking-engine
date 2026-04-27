import { auth0 } from '@/lib/auth/auth0'
import { CheckoutClient } from './CheckoutClient'

export default async function CheckoutPage() {
  const session = await auth0.getSession()
  return <CheckoutClient user={session?.user ?? null} />
}
