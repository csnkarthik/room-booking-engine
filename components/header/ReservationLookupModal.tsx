'use client'

import { Dialog } from '@base-ui/react/dialog'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { X, Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const schema = z.object({
  confirmationNumber: z.string().min(1, 'Confirmation number is required'),
  lastName: z.string().min(1, 'Last name is required'),
  arrivalDate: z.string().min(1, 'Arrival date is required'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReservationLookupModal({ open, onOpenChange }: Props) {
  const router = useRouter()
  const [notFound, setNotFound] = useState(false)
  const [serverError, setServerError] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset()
      setNotFound(false)
      setServerError(false)
    }
    onOpenChange(next)
  }

  async function onSubmit(values: FormValues) {
    setNotFound(false)
    setServerError(false)

    try {
      const res = await fetch('/api/reservations/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        setServerError(true)
        return
      }

      const data = await res.json()

      if (!data.found) {
        setNotFound(true)
        return
      }

      handleOpenChange(false)
      router.push(`/confirmation?reservationId=${data.reservationId}`)
    } catch {
      setServerError(true)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white shadow-2xl transition-all duration-200 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <Dialog.Title className="text-base font-semibold text-gray-900">
                Find My Reservation
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-gray-500">
                Enter your booking details to retrieve your reservation.
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 px-6 py-5">
            <div className="space-y-1">
              <label className="block text-[11px] font-black tracking-[1.5px] text-gray-600 uppercase">
                Confirmation Number <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('confirmationNumber')}
                placeholder="e.g. 12345678"
                className={cn(
                  errors.confirmationNumber && 'border-red-400 focus-visible:ring-red-300'
                )}
              />
              {errors.confirmationNumber && (
                <p className="text-xs text-red-500">{errors.confirmationNumber.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-black tracking-[1.5px] text-gray-600 uppercase">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('lastName')}
                placeholder="e.g. Smith"
                className={cn(errors.lastName && 'border-red-400 focus-visible:ring-red-300')}
              />
              {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-black tracking-[1.5px] text-gray-600 uppercase">
                Arrival Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                {...register('arrivalDate')}
                className={cn(errors.arrivalDate && 'border-red-400 focus-visible:ring-red-300')}
              />
              {errors.arrivalDate && (
                <p className="text-xs text-red-500">{errors.arrivalDate.message}</p>
              )}
            </div>

            {/* Status messages */}
            {notFound && (
              <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                No reservation found matching the details you entered. Please check your
                confirmation number, last name, and arrival date.
              </div>
            )}
            {serverError && (
              <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Something went wrong. Please try again.
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 bg-[#5D3F23] px-4 py-2.5 text-[11px] font-black tracking-[1.5px] text-white uppercase transition-colors hover:bg-[#7A5A3A] disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {isSubmitting ? 'Looking up…' : 'Find Reservation'}
            </button>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
