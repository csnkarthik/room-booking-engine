import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import type { Room, Booking, Availability } from '@/lib/types'
import { CreateBookingInput } from '@/lib/types/schemas'

const dataDir = path.join(process.cwd(), 'lib', 'data')

// Module-level read cache. rooms.json and availability.json are never written
// by the app, so they stay valid for the process lifetime. bookings.json is
// invalidated immediately after every write so reads always reflect reality.
const _cache = new Map<string, unknown>()

function readJson<T>(filename: string): T {
  const filePath = path.join(dataDir, filename)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as T
}

function readJsonCached<T>(filename: string): T {
  if (_cache.has(filename)) return _cache.get(filename) as T
  const data = readJson<T>(filename)
  _cache.set(filename, data)
  return data
}

function writeJson<T>(filename: string, data: T): void {
  const filePath = path.join(dataDir, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export function readRooms(): Room[] {
  return readJsonCached<Room[]>('rooms.json')
}

export function readRoomById(id: string): Room | undefined {
  return readRooms().find((r) => r.id === id)
}

export function readBookings(): Booking[] {
  return readJsonCached<Booking[]>('bookings.json')
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
  _cache.delete('bookings.json')
  return booking
}

export function readAvailability(): Availability[] {
  return readJsonCached<Availability[]>('availability.json')
}

export function readAvailabilityByRoomId(roomId: string): Availability | undefined {
  return readAvailability().find((a) => a.roomId === roomId)
}
