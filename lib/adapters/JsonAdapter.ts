import type { DataAdapter } from './types'
import type { Room, Booking, Availability } from '@/lib/types'
import type { CreateBookingInput } from '@/lib/types/schemas'
import {
  readRooms,
  readRoomById,
  readBookings,
  readBookingById,
  writeBooking,
  readAvailability,
  readAvailabilityByRoomId,
} from '@/lib/utils/data'

/**
 * JsonAdapter — reads/writes local JSON files.
 * Active when DATA_SOURCE=json (default).
 */
export class JsonAdapter implements DataAdapter {
  async getRooms(): Promise<Room[]> {
    return readRooms()
  }

  async getRoomById(id: string): Promise<Room | undefined> {
    return readRoomById(id)
  }

  async getBookings(): Promise<Booking[]> {
    return readBookings()
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    return readBookingById(id)
  }

  async createBooking(input: CreateBookingInput): Promise<Booking> {
    return writeBooking(input)
  }

  async getAvailability(): Promise<Availability[]> {
    return readAvailability()
  }

  async getAvailabilityByRoomId(roomId: string): Promise<Availability | undefined> {
    return readAvailabilityByRoomId(roomId)
  }
}
