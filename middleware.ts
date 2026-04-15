import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // Zustand persists booking state to localStorage (client-side only).
  // Route guards for /checkout and /confirmation are handled client-side
  // in each page's useEffect. No server-side cookie check needed.
  return NextResponse.next()
}

export const config = {
  matcher: ['/checkout', '/confirmation'],
}
