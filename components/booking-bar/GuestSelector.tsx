'use client'

import { useState, useRef, useEffect } from 'react'
import { Users, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GuestSelectorProps {
  value: number
  max?: number
  onChange: (guests: number) => void
  className?: string
}

export function GuestSelector({ value, max = 10, onChange, className }: GuestSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="hover:bg-muted/50 flex h-full w-full items-center gap-2 px-3 py-2 text-left focus:outline-none"
      >
        <Users className="text-muted-foreground h-4 w-4" />
        <div>
          <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Guests
          </div>
          <div className="text-sm font-medium">
            {value} {value === 1 ? 'guest' : 'guests'}
          </div>
        </div>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Select number of guests"
          className="absolute top-full z-50 mt-2 w-56 rounded-xl border bg-white p-4 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Guests</span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => onChange(Math.max(1, value - 1))}
                disabled={value <= 1}
                aria-label="Decrease guests"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-4 text-center text-sm font-semibold">{value}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={value >= max}
                aria-label="Increase guests"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
