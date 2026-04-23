import { z } from 'zod'

export const DateRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const RoomTypeSchema = z.enum([
  'single',
  'double',
  'suite',
  'deluxe',
  'penthouse',
  'apartment',
  'duplex',
])

export const RoomSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: RoomTypeSchema,
  maxGuests: z.number().int().min(1),
  pricePerNight: z.number().positive(),
  images: z.array(z.string().url()).min(1),
  amenities: z.array(z.string()).min(1),
  description: z.string().min(1),
  size: z.number().positive(),
  floor: z.number().int().min(1),
  available: z.boolean(),
})

export const AvailabilitySchema = z.object({
  roomId: z.string(),
  blockedRanges: z.array(DateRangeSchema),
  minStayNights: z.number().int().min(1).default(1),
})

export const GuestSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Phone number is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  countryCode: z.string().length(2, 'Use 2-letter country code'),
})

export const BookingExtrasSchema = z.object({
  breakfast: z.boolean().default(false),
  airportTransfer: z.boolean().default(false),
  lateCheckout: z.boolean().default(false),
})

export const CreateBookingSchema = z.object({
  roomId: z.string(),
  guest: GuestSchema,
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1),
  extras: BookingExtrasSchema,
  totalPrice: z.number().positive(),
  stripePaymentIntentId: z.string(),
  operaReservationId: z.string().optional(),
  operaConfirmationNumber: z.string().optional(),
})

export const BookingSchema = CreateBookingSchema.extend({
  id: z.string(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).default('confirmed'),
  createdAt: z.string(),
})

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>
