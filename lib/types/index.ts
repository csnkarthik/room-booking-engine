export type RoomType = 'single' | 'double' | 'suite' | 'deluxe' | 'penthouse'

export interface Room {
  id: string
  name: string
  type: RoomType
  maxGuests: number
  pricePerNight: number
  images: string[]
  amenities: string[]
  description: string
  size: number // in sq ft
  floor: number
  available: boolean
}

export interface Availability {
  roomId: string
  blockedRanges: DateRange[]
  minStayNights: number
}

export interface DateRange {
  from: string // ISO date string YYYY-MM-DD
  to: string
}

export interface Guest {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface BookingExtras {
  breakfast: boolean
  airportTransfer: boolean
  lateCheckout: boolean
}

export interface Booking {
  id: string
  roomId: string
  room?: Room
  guest: Guest
  checkIn: string // ISO date string
  checkOut: string
  guests: number
  extras: BookingExtras
  totalPrice: number
  stripePaymentIntentId: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}

export interface BookingSession {
  room: Room | null
  checkIn: string | null
  checkOut: string | null
  guests: number
  extras: BookingExtras
}

export interface SearchParams {
  checkIn?: string
  checkOut?: string
  guests?: number
  location?: string
}

export interface DailyPrice {
  date: string
  rates: {
    one: number
    two: number
    three: number
    four: number
    five: number
  }
  roomTypes: string[]
}
