import { Fragment } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Users, Maximize2, Star, ShoppingCart } from 'lucide-react'
import { ImageGallery } from '@/components/room-card/ImageGallery'
import { readRoomById } from '@/lib/utils/data'
import { formatCurrency } from '@/lib/utils/dates'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

const amenityIcons: Record<string, string> = {
  'Free Wi-Fi': '📶',
  'Air Conditioning': '❄️',
  'Flat-screen TV': '📺',
  'Mini-fridge': '🧊',
  Safe: '🔒',
  'Mini-bar': '🍸',
  'Coffee Machine': '☕',
  'Bathrobe & Slippers': '🛁',
  'Nespresso Machine': '☕',
  'Soaking Tub': '🛁',
  'Panoramic View': '🌆',
  'Butler Service': '🎩',
  'Airport Transfer Included': '✈️',
  'Private Terrace with Hot Tub': '🌊',
}

const roomTypeLabels: Record<string, string> = {
  single: 'Single',
  double: 'Double',
  suite: 'Suite',
  deluxe: 'Deluxe',
  penthouse: 'Penthouse',
  room: 'Resort Room',
}

const STEPS = [
  { n: '01', label: 'SEARCH', href: '/' },
  { n: '02', label: 'Booking', href: null },
  { n: '03', label: 'Payment', href: null },
  { n: '04', label: 'Confirmation', href: null },
]

export default async function RoomDetailPage({ params }: PageProps) {
  const { id } = await params

  const room = readRoomById(id)
  if (!room) notFound()

  const typeLabel = roomTypeLabels[room.type] ?? room.type

  return (
    <div className="min-h-screen bg-white">
      {/* ── Step rail — full-width band ── */}
      <nav
        aria-label="Booking progress"
        className="overflow-x-auto border-b border-[#D8D8D8] bg-slate-100"
      >
        <div className="flex min-w-max items-center justify-center py-3 sm:py-[18px]">
          {STEPS.map((step, i) => {
            const isDone = i < 1
            const isCurrent = step.n === '02'
            return (
              <Fragment key={step.n}>
                {i > 0 && (
                  <div aria-hidden className="h-px w-3 shrink-0 bg-[#D8D8D8] sm:w-[22px]" />
                )}
                <div
                  className={cn(
                    'flex items-center gap-2.5 text-[10px] font-black tracking-[1.5px] uppercase sm:text-[11px]',
                    i === 0 ? 'px-[22px]' : 'pr-[22px]',
                    isDone ? 'text-[#006F62]' : isCurrent ? 'text-[#101010]' : 'text-[#9CA3AF]'
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] tracking-normal sm:h-6 sm:w-6',
                      isDone
                        ? 'border-[#006F62] bg-[#006F62] text-white'
                        : isCurrent
                          ? 'border-[#101010] bg-[#101010] text-white'
                          : 'border-current'
                    )}
                  >
                    {step.n}
                  </span>
                  {step.href && isDone ? (
                    <Link href={step.href} className="hover:underline">
                      <span className="hidden sm:inline">{step.label}</span>
                    </Link>
                  ) : (
                    <span className="hidden sm:inline">{step.label}</span>
                  )}
                </div>
              </Fragment>
            )
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-12">
        {/* Room header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <span className="border border-[#D8D8D8] px-2 py-0.5 text-[10px] font-black tracking-[1.5px] text-[#5A3A27] uppercase">
              {typeLabel}
            </span>
            <span className="flex items-center gap-1 text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-semibold text-[#101010]">4.9</span>
            </span>
          </div>
          <h1 className="mb-3 font-[family-name:var(--font-heading)] text-3xl font-medium tracking-wide text-[#101010] md:text-4xl">
            {room.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#8D8D8D]">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Up to {room.maxGuests} {room.maxGuests === 1 ? 'guest' : 'guests'}
            </span>
            <span className="flex items-center gap-1.5">
              <Maximize2 className="h-3.5 w-3.5" />
              {room.size} sq ft
            </span>
            <span className="text-[#D8D8D8]">·</span>
            <span>Floor {room.floor}</span>
          </div>
        </div>

        {/* Image gallery */}
        <div className="mb-10">
          <ImageGallery images={room.images} roomName={room.name} />
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="mb-1 text-[10px] font-black tracking-[2px] text-[#8D8D8D] uppercase">
            About This Room
          </h2>
          <div className="mb-3 h-px w-12 bg-[#006F62]" />
          <p className="leading-relaxed text-[#626262]">{room.description}</p>
        </div>

        {/* Amenities */}
        <div className="mb-8">
          <h2 className="mb-1 text-[10px] font-black tracking-[2px] text-[#8D8D8D] uppercase">
            Amenities
          </h2>
          <div className="mb-4 h-px w-12 bg-[#006F62]" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {room.amenities.map((amenity) => (
              <div key={amenity} className="flex items-center gap-2 text-sm text-[#626262]">
                <span className="text-base">{amenityIcons[amenity] ?? '✓'}</span>
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing breakdown */}
        <div className="mb-8 border border-[#D8D8D8] p-5">
          <h2 className="mb-1 text-[10px] font-black tracking-[2px] text-[#8D8D8D] uppercase">
            Rate Details
          </h2>
          <div className="mb-4 h-px w-12 bg-[#006F62]" />
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
              <span className="text-[#626262]">Room rate</span>
              <span className="font-semibold text-[#101010]">
                {formatCurrency(room.pricePerNight)} / night
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
              <span className="text-[#626262]">Breakfast add-on</span>
              <span className="font-semibold text-[#101010]">+$25 / night</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
              <span className="text-[#626262]">Airport transfer</span>
              <span className="font-semibold text-[#101010]">+$75 one-time</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#626262]">Late checkout</span>
              <span className="font-semibold text-[#101010]">+$50 one-time</span>
            </div>
          </div>
          <p className="mt-4 text-[10px] tracking-wide text-[#8D8D8D] italic">
            All rates exclude applicable taxes and resort fees.
          </p>
        </div>

        {/* View cart CTA */}
        <Link
          href="/cart"
          className="flex items-center justify-center gap-2 bg-[#006F62] py-3.5 text-[11px] font-black tracking-[1.5px] text-white uppercase transition-colors hover:bg-[#008475]"
        >
          <ShoppingCart className="h-4 w-4" />
          View Cart
        </Link>
      </main>
    </div>
  )
}
