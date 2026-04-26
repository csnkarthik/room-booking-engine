import Link from 'next/link'
import { ShoppingCart, User, Star, CalendarCheck } from 'lucide-react'
import { CartBadge } from './CartBadge'

const NAV_LINK =
  'text-[11px] font-black tracking-[1.5px] uppercase text-[#2D2D2D] transition-colors hover:text-[#006F62]'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 h-12 border-b border-[#D8D8D8] bg-white">
      <div className="flex h-full items-center justify-end gap-5 px-4 sm:gap-7 sm:px-6 lg:px-8">
        <Link href="/signin" className={NAV_LINK}>
          <span className="hidden sm:inline">Sign In</span>
          <User className="h-4 w-4 sm:hidden" />
        </Link>

        <Link href="/rewards" className={NAV_LINK}>
          <span className="hidden md:inline">Join Wynn Rewards</span>
          <Star className="h-4 w-4 md:hidden" />
        </Link>

        <CartBadge />

        <Link href="/reservations" className={NAV_LINK}>
          <span className="hidden sm:inline">My Reservation</span>
          <CalendarCheck className="h-4 w-4 sm:hidden" />
        </Link>
      </div>
    </header>
  )
}
