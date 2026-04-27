'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Trash2, ArrowRight } from 'lucide-react'
import { useBookingStore } from '@/lib/store/bookingStore'
import { formatCurrency, formatDisplayDate, daysBetween } from '@/lib/utils/dates'

interface OrderSummaryPanelProps {
  showCheckoutButton?: boolean
  showRemoveButtons?: boolean
}

export function OrderSummaryPanel({
  showCheckoutButton = false,
  showRemoveButtons = false,
}: OrderSummaryPanelProps) {
  const router = useRouter()
  const { cartItems, removeFromCart } = useBookingStore()
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null)

  if (cartItems.length === 0) return null

  function handleRemove(index: number) {
    setPendingRemoveIndex(index)
  }

  function confirmRemove() {
    if (pendingRemoveIndex === null) return
    const isLast = cartItems.length === 1
    removeFromCart(pendingRemoveIndex)
    setPendingRemoveIndex(null)
    if (isLast) router.replace('/')
  }

  function extrasCost(item: (typeof cartItems)[number]) {
    const nights = daysBetween(item.checkIn, item.checkOut)
    return (
      (item.extras.breakfast ? 25 * nights : 0) +
      (item.extras.airportTransfer ? 75 : 0) +
      (item.extras.lateCheckout ? 50 : 0)
    )
  }

  const grandTotal = cartItems.reduce((sum, item) => sum + item.totalPrice + extrasCost(item), 0)

  return (
    <>
      <div className="overflow-hidden border border-[#D8D8D8] bg-white">
        {/* Header */}
        <div className="bg-[#5A3A27] px-5 py-4">
          <p className="text-[11px] font-black tracking-[2px] text-[#DDBE77] uppercase">
            Order Summary
          </p>
          <p className="mt-0.5 font-[family-name:var(--font-heading)] text-lg font-medium text-white">
            {cartItems.length} room{cartItems.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        <div className="p-5">
          {/* Cart items */}
          <div className="mb-4 space-y-3">
            {cartItems.map((item, index) => {
              const nights = daysBetween(item.checkIn, item.checkOut)
              return (
                <div key={index} className="border border-[#D8D8D8] p-3">
                  <div className="flex gap-3">
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden">
                      <Image
                        src={item.room.images[0]}
                        alt={item.room.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs leading-tight font-semibold text-[#101010]">
                          {item.room.name}
                        </p>
                        {showRemoveButtons && (
                          <button
                            onClick={() => handleRemove(index)}
                            aria-label={`Remove ${item.room.name}`}
                            className="shrink-0 p-0.5 text-[#8D8D8D] transition-colors hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] text-[#8D8D8D]">
                        {formatDisplayDate(item.checkIn)} — {formatDisplayDate(item.checkOut)}
                      </p>
                      <p className="text-[10px] text-[#8D8D8D]">
                        {item.guests} guest{item.guests !== 1 ? 's' : ''} · {nights} night
                        {nights !== 1 ? 's' : ''}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[#006F62]">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order total */}
          <div className="mb-4 border border-[#D8D8D8] bg-[#F8F5F0] p-3">
            <div className="space-y-2">
              {cartItems.map((item, index) => {
                const nights = daysBetween(item.checkIn, item.checkOut)
                return (
                  <div key={index}>
                    <div className="flex justify-between text-[#626262]">
                      <span className="truncate pr-2 text-xs">
                        {item.room.name} × {nights}n
                      </span>
                      <span className="shrink-0 text-xs font-medium text-[#101010]">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                    {item.extras.breakfast && (
                      <div className="flex justify-between text-[#626262]">
                        <span className="pl-2 text-[10px]">↳ Breakfast × {nights}n</span>
                        <span className="text-[10px] text-[#101010]">
                          {formatCurrency(25 * nights)}
                        </span>
                      </div>
                    )}
                    {item.extras.airportTransfer && (
                      <div className="flex justify-between text-[#626262]">
                        <span className="pl-2 text-[10px]">↳ Airport Transfer</span>
                        <span className="text-[10px] text-[#101010]">{formatCurrency(75)}</span>
                      </div>
                    )}
                    {item.extras.lateCheckout && (
                      <div className="flex justify-between text-[#626262]">
                        <span className="pl-2 text-[10px]">↳ Late Checkout</span>
                        <span className="text-[10px] text-[#101010]">{formatCurrency(50)}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[#D8D8D8] pt-2">
              <span className="text-[11px] font-black tracking-[1px] text-[#101010] uppercase">
                Total
              </span>
              <span className="text-base font-bold text-[#006F62]">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {showCheckoutButton && (
            <>
              <button
                type="button"
                onClick={() => router.push('/checkout')}
                className="mb-3 flex w-full items-center justify-center gap-2 bg-[#006F62] py-3.5 text-[11px] font-black tracking-[1.5px] text-white uppercase transition-colors hover:bg-[#008475]"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-center text-[10px] tracking-wider text-[#8D8D8D]">
                You won&apos;t be charged yet
              </p>
            </>
          )}
        </div>
      </div>

      {/* Remove confirmation modal */}
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
                      className="flex-1 border border-[#D8D8D8] py-3 text-[11px] font-black tracking-[1.5px] text-[#101010] uppercase transition-colors hover:border-[#101010]"
                    >
                      Keep it
                    </button>
                    <button
                      onClick={confirmRemove}
                      className="flex-1 bg-red-600 py-3 text-[11px] font-black tracking-[1.5px] text-white uppercase transition-colors hover:bg-red-700"
                    >
                      {isLast ? 'Remove & Leave' : 'Yes, Remove'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
    </>
  )
}
