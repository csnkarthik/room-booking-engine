import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#5A3A27] py-8 text-center text-xs text-[#FFF]">
      <div className="mx-auto max-w-4xl px-6">
        <nav className="mb-2 flex flex-wrap items-center justify-center gap-1 tracking-widest uppercase">
          <Link href="/" className="transition-colors hover:text-white">
            Encore Boston Harbor
          </Link>
          <span className="mx-2 opacity-40">|</span>
          <Link href="/privacy" className="transition-colors hover:text-white">
            Privacy
          </Link>
          <span className="mx-2 opacity-40">|</span>
          <Link href="/terms" className="transition-colors hover:text-white">
            Terms &amp; Conditions
          </Link>
        </nav>
        <p className="tracking-wider">
          &copy; 2026 Wynn Resorts Holdings, LLC. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
