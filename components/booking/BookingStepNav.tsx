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
  currentStep: 1 | 2 | 3 | 4
}

export function BookingStepNav({ currentStep }: BookingStepNavProps) {
  return (
    <nav
      aria-label="Booking progress"
      className="sticky top-12 z-40 border-b border-[#D8D8D8] bg-white"
    >
      <div className="mx-auto flex max-w-[1440px] items-center px-4 py-3 sm:px-6 sm:py-[14px] lg:h-[94px] lg:px-12 lg:py-0">
        {/* Logo */}
        <Link href="/" className="mr-4 shrink-0 sm:mr-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.ctfassets.net/qroo0r04c02g/5p78pbHlHkjEvU9yRbRCQ6/f1544afe51ba329c5989fada417b94bd/ebh-animated-2.gif"
            alt="Encore Boston Harbor"
            className="h-8 w-auto object-contain lg:h-11"
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

        {/* Add Another Room — green CTA */}
        <Link
          href="/"
          className="ml-4 flex shrink-0 cursor-pointer items-center gap-1.5 bg-[#006F62] px-3 py-2 text-[11px] font-black tracking-[1.5px] text-white uppercase transition-colors hover:bg-[#015A4F] sm:ml-8 sm:px-5 sm:text-[12px]"
        >
          <Plus className="h-3 w-3 shrink-0" />
          <span className="hidden sm:inline">Add Another Room</span>
        </Link>
      </div>
    </nav>
  )
}
