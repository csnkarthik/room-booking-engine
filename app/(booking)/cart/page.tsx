'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Maximize2, Star, ArrowRight } from 'lucide-react'
import { ImageGallery } from '@/components/room-card/ImageGallery'
import { BookingStepNav } from '@/components/booking/BookingStepNav'
import { OrderSummaryPanel } from '@/components/booking/OrderSummaryPanel'
import { ModifyBookingDialog } from '@/components/cart/ModifyBookingDialog'
import { useBookingStore } from '@/lib/store/bookingStore'
import { formatCurrency, formatDisplayDate, daysBetween } from '@/lib/utils/dates'
import { cn } from '@/lib/utils'

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

export default function CartPage() {
  const router = useRouter()
  const { cartItems, removeFromCart, updateCartItemExtras } = useBookingStore()
  const [activeTab, setActiveTab] = useState(0)
  const [modifyOpen, setModifyOpen] = useState(false)
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null)

  function confirmRemove() {
    if (pendingRemoveIndex === null) return
    const isLast = cartItems.length === 1
    removeFromCart(pendingRemoveIndex)
    setPendingRemoveIndex(null)
    if (isLast) router.replace('/')
  }

  useEffect(() => {
    if (cartItems.length === 0) {
      router.replace('/')
    }
  }, [cartItems.length, router])

  if (cartItems.length === 0) return null

  const safeTab = Math.min(activeTab, cartItems.length - 1)
  const activeItem = cartItems[safeTab]
  const activeRoom = activeItem.room
  const typeLabel = roomTypeLabels[activeRoom.type] ?? activeRoom.type

  const activeNights = daysBetween(activeItem.checkIn, activeItem.checkOut)
  const activeExtras = activeItem.extras

  function itemExtrasCost(item: (typeof cartItems)[number]) {
    const nights = daysBetween(item.checkIn, item.checkOut)
    return (
      (item.extras.breakfast ? 25 * nights : 0) +
      (item.extras.airportTransfer ? 75 : 0) +
      (item.extras.lateCheckout ? 50 : 0)
    )
  }

  const grandTotal = cartItems.reduce(
    (sum, item) => sum + item.totalPrice + itemExtrasCost(item),
    0
  )

  return (
    <div className="min-h-screen bg-white">
      <BookingStepNav currentStep={1} />

      {/* ── Main content — extra bottom padding on mobile for sticky footer ── */}
      <main className="mx-auto max-w-[1440px] px-4 pt-6 pb-28 sm:px-6 sm:pt-8 md:pb-8 lg:px-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* ── Left column ── */}
          <div className="md:col-span-2">
            {/* Room tabs — only shown when 2+ rooms in cart */}
            {cartItems.length > 1 && (
              <div className="-mx-4 mb-6 overflow-x-auto border-b border-[#D8D8D8] sm:mx-0">
                <div className="flex min-w-max px-4 sm:px-0">
                  {cartItems.map((_, i) => {
                    const isActive = i === safeTab
                    return (
                      <button
                        key={i}
                        onClick={() => setActiveTab(i)}
                        className={cn(
                          'cursor-pointer px-5 py-2.5 text-[11px] font-black tracking-[1.5px] whitespace-nowrap uppercase transition-colors',
                          isActive
                            ? 'border-b-2 border-[#006F62] text-[#006F62]'
                            : 'text-[#8D8D8D] hover:text-[#101010]'
                        )}
                      >
                        Room {i + 1}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Image gallery */}
            <div className="-mx-4 sm:mx-0">
              <ImageGallery images={activeRoom.images} roomName={activeRoom.name} />
            </div>

            {/* Room header — title left, actions right */}
            <div className="mb-6 flex items-start justify-between gap-4 pt-5 sm:mb-8">
              {/* Left: badges + title + meta */}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <span className="border border-[#D8D8D8] px-2 py-0.5 text-[10px] font-black tracking-[1.5px] text-[#5A3A27] uppercase">
                    {typeLabel}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="text-xs font-semibold text-[#101010]">4.9</span>
                  </span>
                </div>
                <h1 className="mb-3 font-[family-name:var(--font-heading)] text-2xl font-medium tracking-wide text-[#101010] sm:text-3xl md:text-4xl">
                  {activeRoom.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#8D8D8D] sm:gap-4">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Up to {activeRoom.maxGuests} {activeRoom.maxGuests === 1 ? 'guest' : 'guests'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Maximize2 className="h-3.5 w-3.5" />
                    {activeRoom.size} sq ft
                  </span>
                  <span className="text-[#D8D8D8]">·</span>
                  <span>Floor {activeRoom.floor}</span>
                </div>
              </div>

              {/* Right: Modify / Cancel */}
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:gap-3">
                <button
                  type="button"
                  onClick={() => setModifyOpen(true)}
                  className="cursor-pointer border border-[#006F62] px-4 py-2 text-[11px] font-black tracking-[1.5px] text-[#006F62] uppercase transition-colors hover:bg-[#006F62] hover:text-white sm:px-5 sm:py-2.5"
                >
                  Modify
                </button>
                <button
                  type="button"
                  onClick={() => setPendingRemoveIndex(safeTab)}
                  className="cursor-pointer border border-[#D8D8D8] px-4 py-2 text-[11px] font-black tracking-[1.5px] text-[#626262] uppercase transition-colors hover:border-red-500 hover:text-red-500 sm:px-5 sm:py-2.5"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* About */}
            <div className="mb-6 sm:mb-8">
              <h2 className="mb-1 text-[10px] font-black tracking-[2px] text-[#8D8D8D] uppercase">
                About This Room
              </h2>
              <div className="mb-3 h-px w-12 bg-[#006F62]" />
              <p className="text-sm leading-relaxed text-[#626262] sm:text-base">
                {activeRoom.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="mb-6 sm:mb-8">
              <h2 className="mb-1 text-[10px] font-black tracking-[2px] text-[#8D8D8D] uppercase">
                Amenities
              </h2>
              <div className="mb-4 h-px w-12 bg-[#006F62]" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-x-6 md:grid-cols-3">
                {activeRoom.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-sm text-[#626262]">
                    <span className="shrink-0 text-base">{amenityIcons[amenity] ?? '✓'}</span>
                    <span className="leading-tight">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rate Details */}
            <div className="mb-6 border border-[#D8D8D8] p-4 sm:mb-8 sm:p-5">
              <h2 className="mb-1 text-[10px] font-black tracking-[2px] text-[#8D8D8D] uppercase">
                Rate Details
              </h2>
              <div className="mb-4 h-px w-12 bg-[#006F62]" />
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
                  <span className="text-[#626262]">Room rate</span>
                  <span className="font-semibold text-[#101010]">
                    {formatCurrency(activeRoom.pricePerNight)} / night
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

            {/* Add-ons */}
            <div className="border border-[#D8D8D8] p-4 sm:p-5">
              <h2 className="mb-1 text-[10px] font-black tracking-[2px] text-[#8D8D8D] uppercase">
                Add-ons
              </h2>
              <div className="mb-4 h-px w-12 bg-[#006F62]" />
              <div className="space-y-3">
                {(
                  [
                    {
                      key: 'breakfast' as const,
                      label: 'Breakfast',
                      price: `+$25 / night × ${activeNights} night${activeNights !== 1 ? 's' : ''}`,
                    },
                    {
                      key: 'airportTransfer' as const,
                      label: 'Airport Transfer',
                      price: '+$75 one-time',
                    },
                    {
                      key: 'lateCheckout' as const,
                      label: 'Late Checkout (until 2pm)',
                      price: '+$50 one-time',
                    },
                  ] as const
                ).map(({ key, label, price }) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-3 border border-[#D8D8D8] p-3 transition-colors hover:border-[#006F62]"
                  >
                    <input
                      type="checkbox"
                      checked={activeExtras[key]}
                      onChange={(e) => updateCartItemExtras(safeTab, { [key]: e.target.checked })}
                      className="h-4 w-4 shrink-0 accent-[#006F62]"
                      aria-label={label}
                    />
                    <span className="min-w-0 flex-1 text-sm text-[#101010]">{label}</span>
                    <span className="shrink-0 text-[10px] text-[#8D8D8D] sm:text-xs">{price}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column — tablet/desktop (mobile uses sticky footer) ── */}
          <div className="hidden md:col-span-1 md:block">
            <div className="md:sticky md:top-20">
              <OrderSummaryPanel showCheckoutButton />
            </div>
          </div>
        </div>
      </main>

      {/* ── Modify Booking dialog ── */}
      <ModifyBookingDialog
        open={modifyOpen}
        onClose={() => setModifyOpen(false)}
        itemIndex={safeTab}
        cartItem={cartItems[safeTab]}
      />

      {/* ── Remove confirmation modal ── */}
      {pendingRemoveIndex !== null &&
        (() => {
          const item = cartItems[pendingRemoveIndex]
          const isLast = cartItems.length === 1
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="remove-modal-title"
            >
              <div className="w-full max-w-sm overflow-hidden border border-[#D8D8D8] bg-white">
                <div className="bg-[#5A3A27] px-5 py-4">
                  <p
                    id="remove-modal-title"
                    className="font-[family-name:var(--font-heading)] text-lg font-medium text-white"
                  >
                    Remove this room?
                  </p>
                </div>
                <div className="px-5 py-4">
                  <p className="mb-1 text-sm font-semibold text-[#101010]">{item.room.name}</p>
                  <p className="mb-5 text-sm leading-relaxed text-[#626262]">
                    {isLast
                      ? 'This is the last room in your cart. Removing it will take you back to the home page.'
                      : 'Are you sure you want to remove this room from your cart?'}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPendingRemoveIndex(null)}
                      className="flex-1 cursor-pointer border border-[#D8D8D8] py-3 text-[11px] font-black tracking-[1.5px] text-[#101010] uppercase transition-colors hover:border-[#101010]"
                    >
                      Keep it
                    </button>
                    <button
                      onClick={confirmRemove}
                      className="flex-1 cursor-pointer bg-red-600 py-3 text-[11px] font-black tracking-[1.5px] text-white uppercase transition-colors hover:bg-red-700"
                    >
                      {isLast ? 'Remove & Leave' : 'Yes, Remove'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

      {/* ── Mobile sticky checkout bar — hidden on md+ ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D8D8D8] bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:hidden">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[1.5px] text-[#8D8D8D] uppercase">
            Total
          </span>
          <span className="text-base font-bold text-[#006F62]">{formatCurrency(grandTotal)}</span>
        </div>
        <button
          type="button"
          onClick={() => router.push('/checkout')}
          className="flex w-full cursor-pointer items-center justify-center gap-2 bg-[#006F62] py-3.5 text-[11px] font-black tracking-[1.5px] text-white uppercase transition-colors active:bg-[#008475]"
        >
          Proceed to Checkout
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
