import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Room, BookingExtras } from '@/lib/types'
import { calculateTotalPrice } from '@/lib/utils/dates'

interface BookingState {
  room: Room | null
  checkIn: string | null
  checkOut: string | null
  guests: number
  extras: BookingExtras
  totalPrice: number

  setRoom: (room: Room) => void
  setDates: (checkIn: string, checkOut: string) => void
  setGuests: (guests: number) => void
  setExtras: (extras: Partial<BookingExtras>) => void
  clearBooking: () => void
}

const defaultExtras: BookingExtras = {
  breakfast: false,
  airportTransfer: false,
  lateCheckout: false,
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      room: null,
      checkIn: null,
      checkOut: null,
      guests: 1,
      extras: defaultExtras,
      totalPrice: 0,

      setRoom: (room) => {
        const { checkIn, checkOut, extras } = get()
        const totalPrice =
          checkIn && checkOut
            ? calculateTotalPrice(room.pricePerNight, checkIn, checkOut, extras)
            : 0
        set({ room, totalPrice })
      },

      setDates: (checkIn, checkOut) => {
        const { room, extras } = get()
        const totalPrice = room
          ? calculateTotalPrice(room.pricePerNight, checkIn, checkOut, extras)
          : 0
        set({ checkIn, checkOut, totalPrice })
      },

      setGuests: (guests) => set({ guests }),

      setExtras: (newExtras) => {
        const { room, checkIn, checkOut, extras } = get()
        const merged = { ...extras, ...newExtras }
        const totalPrice =
          room && checkIn && checkOut
            ? calculateTotalPrice(room.pricePerNight, checkIn, checkOut, merged)
            : 0
        set({ extras: merged, totalPrice })
      },

      clearBooking: () =>
        set({
          room: null,
          checkIn: null,
          checkOut: null,
          guests: 1,
          extras: defaultExtras,
          totalPrice: 0,
        }),
    }),
    {
      name: 'booking-session',
      partialize: (state) => ({
        room: state.room,
        checkIn: state.checkIn,
        checkOut: state.checkOut,
        guests: state.guests,
        extras: state.extras,
        totalPrice: state.totalPrice,
      }),
    }
  )
)
