import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Room, BookingExtras, CartItem } from '@/lib/types'
import { calculateTotalPrice } from '@/lib/utils/dates'
import { calculateStayPrice } from '@/lib/utils/pricing'

interface BookingState {
  // Search bar / room-detail state (single in-progress selection)
  room: Room | null
  checkIn: string | null
  checkOut: string | null
  guests: number
  rooms: number
  extras: BookingExtras
  totalPrice: number

  // Multi-room cart
  cartItems: CartItem[]

  setRoom: (room: Room) => void
  setDates: (checkIn: string, checkOut: string) => void
  setGuests: (guests: number) => void
  setRooms: (rooms: number) => void
  setExtras: (extras: Partial<BookingExtras>) => void
  clearBooking: () => void

  addToCart: (item: CartItem) => void
  removeFromCart: (index: number) => void
  updateCartItemExtras: (index: number, extras: Partial<BookingExtras>) => void
  clearCart: () => void
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
      rooms: 1,
      extras: defaultExtras,
      totalPrice: 0,
      cartItems: [],

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

      setRooms: (rooms) => set({ rooms }),

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
          rooms: 1,
          extras: defaultExtras,
          totalPrice: 0,
        }),

      addToCart: (item) => set((state) => ({ cartItems: [...state.cartItems, item] })),

      removeFromCart: (index) =>
        set((state) => ({
          cartItems: state.cartItems.filter((_, i) => i !== index),
        })),

      updateCartItemExtras: (index, partialExtras) =>
        set((state) => ({
          cartItems: state.cartItems.map((item, i) => {
            if (i !== index) return item
            const merged = { ...item.extras, ...partialExtras }
            return {
              ...item,
              extras: merged,
              totalPrice: calculateStayPrice(
                item.room.pricePerNight,
                item.checkIn,
                item.checkOut,
                merged
              ),
            }
          }),
        })),

      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: 'booking-session',
      partialize: (state) => ({
        room: state.room,
        checkIn: state.checkIn,
        checkOut: state.checkOut,
        guests: state.guests,
        rooms: state.rooms,
        extras: state.extras,
        totalPrice: state.totalPrice,
        cartItems: state.cartItems,
      }),
    }
  )
)
