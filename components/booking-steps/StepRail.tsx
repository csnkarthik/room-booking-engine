'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { useBookingStore } from '@/lib/store/bookingStore'
import { cn } from '@/lib/utils'

interface StepRailProps {
  currentStep: 1 | 2 | 3 | 4
}

const STEPS = [
  { label: 'Search', href: '/' },
  { label: 'Suite', href: null },
  { label: 'Checkout', href: '/checkout' },
  { label: 'Confirm', href: null },
]

export function StepRail({ currentStep }: StepRailProps) {
  const cartItems = useBookingStore((s) => s.cartItems)
  const hasCart = cartItems.length > 0

  return (
    <div className="border-b border-[#E8D9C5] bg-white px-4 py-4">
      <div className="mx-auto flex max-w-7xl items-center">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentStep - 1
          const isActive = i === currentStep - 1
          const isFuture = i > currentStep - 1

          const circle = (
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                isCompleted && 'bg-[#3D2314] text-white',
                isActive && 'bg-[#C8B89A] text-[#3D2314] ring-2 ring-[#3D2314]/20',
                isFuture && 'border-2 border-[#E8D9C5] bg-white text-[#C8B89A]'
              )}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
            </div>
          )

          const label = (
            <span
              className={cn(
                'mt-1 hidden text-xs sm:block',
                isCompleted && 'font-medium text-[#3D2314]',
                isActive && 'font-semibold text-[#3D2314]',
                isFuture && 'text-[#C8B89A]'
              )}
            >
              {step.label}
            </span>
          )

          let stepNode: React.ReactNode
          if (isCompleted && step.href) {
            stepNode = (
              <Link href={step.href} className="flex flex-col items-center">
                {circle}
                {label}
              </Link>
            )
          } else if (isActive) {
            stepNode = (
              <div className="flex flex-col items-center">
                {circle}
                {label}
              </div>
            )
          } else if (!isCompleted && step.href === '/checkout' && hasCart) {
            stepNode = (
              <Link href={step.href} className="flex flex-col items-center">
                {circle}
                {label}
              </Link>
            )
          } else {
            stepNode = (
              <div className="flex flex-col items-center">
                {circle}
                {label}
              </div>
            )
          }

          return (
            <div key={step.label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">{stepNode}</div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn('mx-2 h-px flex-1', isCompleted ? 'bg-[#3D2314]' : 'bg-[#E8D9C5]')}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
