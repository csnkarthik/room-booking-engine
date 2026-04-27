import Image from 'next/image'
import Link from 'next/link'
import { Fragment } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { n: '01', label: 'SUITE' },
  { n: '02', label: 'CHECKOUT' },
  { n: '03', label: 'CONFIRM' },
]

interface BookingStepNavProps {
  currentStep: 1 | 2 | 3
}

export function BookingStepNav({ currentStep }: BookingStepNavProps) {
  return (
    <nav aria-label="Booking progress" className="border-b border-[#D8D8D8] bg-slate-100">
      <div className="mx-auto flex max-w-[1440px] items-center px-4 py-3 sm:px-6 sm:py-[14px] lg:px-12">
        {/* Logo */}
        <Link href="/" className="mr-4 shrink-0 sm:mr-8">
          <Image
            src="https://wynncdn.shrglobal.com/CrsMedia/P13764/bbe/encore-animated-logo-wynn-resort-212-once.png"
            alt="Wynn Las Vegas"
            width={120}
            height={40}
            className="h-8 w-auto object-contain"
            unoptimized
          />
        </Link>

        {/* Steps — centred */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex min-w-max items-center">
            {STEPS.map((step, i) => {
              const stepNum = i + 1
              const isDone = stepNum < currentStep
              const isCurrent = stepNum === currentStep
              return (
                <Fragment key={step.n}>
                  {i > 0 && (
                    <div aria-hidden className="h-px w-3 shrink-0 bg-[#D8D8D8] sm:w-[22px]" />
                  )}
                  <div
                    className={cn(
                      'flex items-center gap-1.5 sm:gap-2.5',
                      'text-[10px] font-black tracking-[1.5px] uppercase sm:text-[11px]',
                      isDone ? 'text-[#006F62]' : isCurrent ? 'text-[#101010]' : 'text-[#9CA3AF]'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] tracking-normal sm:h-6 sm:w-6 sm:text-[10px]',
                        isDone
                          ? 'border-[#006F62] bg-[#006F62] text-white'
                          : isCurrent
                            ? 'border-[#101010] bg-[#101010] text-white'
                            : 'border-current'
                      )}
                    >
                      {step.n}
                    </span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </div>
                </Fragment>
              )
            })}
          </div>
        </div>

        {/* Add Another Room — right */}
        <Link
          href="/"
          className="ml-4 flex shrink-0 items-center gap-1.5 text-[10px] font-black tracking-[1.5px] text-[#006F62] uppercase transition-colors hover:text-[#008475] sm:ml-8"
        >
          <Plus className="h-3 w-3" />
          <span className="hidden sm:inline">Add Another Room</span>
        </Link>
      </div>
    </nav>
  )
}
