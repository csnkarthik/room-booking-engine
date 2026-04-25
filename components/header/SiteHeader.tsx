import Image from 'next/image'
import Link from 'next/link'
import { CartBadge } from './CartBadge'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E8D9C5] bg-[#3D2314] shadow-sm">
      <div className="relative flex flex-col items-center gap-1 py-4">
        <Link href="/" aria-label="Home">
          <Image
            src="/logo.gif"
            alt="Encore Boston Harbor"
            width={120}
            height={72}
            unoptimized
            className="h-14 w-auto brightness-0 invert"
          />
        </Link>
        <p className="text-xs font-light tracking-[0.2em] text-[#C8B89A] uppercase">
          A Wynn Resort
        </p>
        <CartBadge />
      </div>
    </header>
  )
}
