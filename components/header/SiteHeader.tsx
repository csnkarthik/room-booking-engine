import Link from 'next/link'
import { User, Star, Plane } from 'lucide-react'
import { CartBadge } from './CartBadge'
import { UserMenu } from './UserMenu'
import { ReservationButton } from './ReservationButton'
import { auth0 } from '@/lib/auth/auth0'

const NAV_LINK =
  'text-[11px] font-black tracking-[1.5px] uppercase text-white/80 transition-colors hover:text-[#DDBE77]'

const DIVIDER = <span className="text-white/30" aria-hidden>|</span>

export async function SiteHeader() {
  const session = await auth0.getSession()
  const user = session?.user

  return (
    <header className="sticky top-0 z-50 h-10 border-b border-[#7A5A3A] bg-[#5D3F23]">
      <div className="mx-auto flex h-full w-full max-w-[1140px] items-center justify-between gap-5 px-2 sm:gap-2 sm:px-6 lg:px-12">
        <div className="flex items-center gap-3 sm:gap-4">

        </div>

        <div className="flex items-center gap-5 sm:gap-4">
          <ReservationButton />
          {DIVIDER}
          <CartBadge />
          {DIVIDER}
          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              {/* Use <a> so proxy can intercept the login redirect */}
              <a href="/auth/login" className={NAV_LINK}>
                <span className="hidden sm:inline">Sign In</span>
                <User className="h-4 w-4 sm:hidden" aria-hidden />
              </a>
              {DIVIDER}
              <Link href="/rewards" className={NAV_LINK}>
                <span className="hidden md:inline">Join Wynn Rewards</span>
                <Star className="h-4 w-4 md:hidden" aria-hidden />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
