import Link from 'next/link'
import { User, Star } from 'lucide-react'
import { CartBadge } from './CartBadge'
import { UserMenu } from './UserMenu'
import { ReservationButton } from './ReservationButton'
import { auth0 } from '@/lib/auth/auth0'

const NAV_LINK =
  'text-[11px] font-black tracking-[1.5px] uppercase text-white/80 transition-colors hover:text-[#DDBE77]'

export async function SiteHeader() {
  const session = await auth0.getSession()
  const user = session?.user

  return (
    <header className="sticky top-0 z-50 h-12 border-b border-[#7A5A3A] bg-[#5D3F23]">
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-end gap-5 px-4 sm:gap-7 sm:px-6 lg:px-12">
        {user ? (
          <UserMenu user={user} />
        ) : (
          <>
            {/* Use <a> so proxy can intercept the login redirect */}
            <a href="/auth/login" className={NAV_LINK}>
              <span className="hidden sm:inline">Sign In</span>
              <User className="h-4 w-4 sm:hidden" aria-hidden />
            </a>
            <Link href="/rewards" className={NAV_LINK}>
              <span className="hidden md:inline">Join Wynn Rewards</span>
              <Star className="h-4 w-4 md:hidden" aria-hidden />
            </Link>
          </>
        )}

        <CartBadge />

        <ReservationButton />
      </div>
    </header>
  )
}
