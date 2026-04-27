'use client'

import { useState } from 'react'
import { CalendarCheck } from 'lucide-react'
import { ReservationLookupModal } from './ReservationLookupModal'

const NAV_LINK =
  'text-[11px] font-black tracking-[1.5px] uppercase text-white/80 transition-colors hover:text-[#DDBE77]'

export function ReservationButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)} className={NAV_LINK + ' cursor-pointer'}>
        <span className="hidden sm:inline">My Reservation</span>
        <CalendarCheck className="h-4 w-4 sm:hidden" aria-hidden />
      </button>
      <ReservationLookupModal open={open} onOpenChange={setOpen} />
    </>
  )
}
