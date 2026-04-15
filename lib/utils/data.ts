import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import type { Room, Booking, Availability } from '@/lib/types'
import { CreateBookingInput } from '@/lib/types/schemas'

const dataDir = path.join(process.cwd(), 'lib', 'data')

function readJson<T>(filename: string): T {
  const filePath = path.join(dataDir, filename)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as T
}

function writeJson<T>(filename: string, data: T): void {
  const filePath = path.join(dataDir, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export function readRooms(): Room[] {
  return readJson<Room[]>('rooms.json')
}

export function readRoomById(id: string): Room | undefined {
  return readRooms().find((r) => r.id === id)
}

export function readBookings(): Booking[] {
  return readJson<Booking[]>('bookings.json')
}

export function readBookingById(id: string): Booking | undefined {
  return readBookings().find((b) => b.id === id)
}

export function writeBooking(input: CreateBookingInput): Booking {
  const bookings = readBookings()
  const room = readRoomById(input.roomId)

  const booking: Booking = {
    ...input,
    id: uuidv4(),
    room,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }

  bookings.push(booking)
  writeJson('bookings.json', bookings)
  return booking
}

export function readAvailability(): Availability[] {
  return readJson<Availability[]>('availability.json')
}

export function readAvailabilityByRoomId(roomId: string): Availability | undefined {
  return readAvailability().find((a) => a.roomId === roomId)
}
