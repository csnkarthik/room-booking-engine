'use client'

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, CalendarDays, Tag, Trophy, LogOut, User } from 'lucide-react'
import type { User as Auth0User } from '@auth0/nextjs-auth0/types'
import { ReservationLookupModal } from './ReservationLookupModal'

const TRIGGER_CLASS =
  'flex cursor-pointer items-center gap-1 text-[11px] font-black tracking-[1.5px] uppercase text-white/80 outline-none transition-colors hover:text-[#DDBE77]'

const ITEM_LINK_CLASS = 'flex w-full items-center gap-2 text-gray-800 hover:text-[#5D3F23]'

interface UserMenuProps {
  user: Auth0User
}

export function UserMenu({ user }: UserMenuProps) {
  const displayName = user.given_name ?? user.name ?? user.email
  const [lookupOpen, setLookupOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className={TRIGGER_CLASS}>
          <span className="hidden sm:inline">Welcome, {displayName}</span>
          <User className="h-4 w-4 sm:hidden" aria-hidden />
          <ChevronDown className="hidden h-3 w-3 sm:block" aria-hidden />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-48 border border-gray-200 bg-white p-1 text-gray-800 shadow-lg"
        >
          <DropdownMenuItem
            className="p-0 focus:bg-gray-100"
            onSelect={(e) => {
              e.preventDefault()
              setLookupOpen(true)
            }}
          >
            <span className={ITEM_LINK_CLASS + ' cursor-pointer px-2 py-1.5'}>
              <CalendarDays className="h-4 w-4" aria-hidden />
              My Stays
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem className="p-0 focus:bg-gray-100">
            <a href="/offers" className={ITEM_LINK_CLASS + ' px-2 py-1.5'}>
              <Tag className="h-4 w-4" aria-hidden />
              My Offers
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem className="p-0 focus:bg-gray-100">
            <a href="/rewards" className={ITEM_LINK_CLASS + ' px-2 py-1.5'}>
              <Trophy className="h-4 w-4" aria-hidden />
              Rewards Summary
            </a>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-200" />

          {/* Full page request required so proxy can clear the session cookie */}
          <DropdownMenuItem className="p-0 focus:bg-gray-100">
            <a href="/auth/logout" className={ITEM_LINK_CLASS + ' px-2 py-1.5'}>
              <LogOut className="h-4 w-4" aria-hidden />
              Sign Out
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReservationLookupModal open={lookupOpen} onOpenChange={setLookupOpen} />
    </>
  )
}
