import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#3D2314] py-10 text-center text-xs text-[#C8B89A]">
      <div className="mx-auto max-w-4xl px-6">
        <nav className="mb-3 flex flex-wrap items-center justify-center gap-1 tracking-widest uppercase">
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
        <p className="mb-6 tracking-wider">
          &copy; 2026 Wynn Resorts Holdings, LLC. All rights reserved.
        </p>
        <p className="leading-relaxed">
          If you or a loved one is experiencing problems with gambling and needs support, call (800)
          327-5050 or visit{' '}
          <a href="https://www.mahelpline.org/problemgambling" className="hover:underline">
            mahelpline.org/problemgambling
          </a>{' '}
          to speak with a trained Specialist.
          <br />
          Specialists are available 24/7 and services are free, confidential, and available in
          multiple languages.
        </p>
      </div>
    </footer>
  )
}
