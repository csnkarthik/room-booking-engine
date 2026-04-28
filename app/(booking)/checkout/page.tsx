import { auth0 } from '@/lib/auth/auth0'
import { CheckoutClient } from './CheckoutClient'

export default async function CheckoutPage() {
  const session = await auth0.getSession()
  if (session) {
    try {
      const { token } = await auth0.getAccessToken()
      console.log('Auth0 access token:', token)
    } catch {
      // no token available
    }
  }
  return <CheckoutClient user={session?.user ?? null} />
}
