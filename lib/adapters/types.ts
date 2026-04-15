import type { Room, Booking, Availability } from '@/lib/types'
import type { CreateBookingInput } from '@/lib/types/schemas'

/**
 * DataAdapter interface — swap JSON ↔ REST API with zero component changes.
 * Set DATA_SOURCE env var to switch adapters.
 */
export interface DataAdapter {
  getRooms(): Promise<Room[]>
  getRoomById(id: string): Promise<Room | undefined>
  getBookings(): Promise<Booking[]>
  getBookingById(id: string): Promise<Booking | undefined>
  createBooking(input: CreateBookingInput): Promise<Booking>
  getAvailability(): Promise<Availability[]>
  getAvailabilityByRoomId(roomId: string): Promise<Availability | undefined>
}
