export type RoomType =
  //| 'single'
  //| 'double'
  | 'suite'
  // | 'deluxe'
  // | 'penthouse'
  // | 'apartment'
  // | 'duplex'
  | 'room' // Generic type for all non-suite rooms

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
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  countryCode: string
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
  operaReservationId?: string
  operaConfirmationNumber?: string
}

export interface CartItem {
  room: Room
  checkIn: string
  checkOut: string
  guests: number
  extras: BookingExtras
  totalPrice: number
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
