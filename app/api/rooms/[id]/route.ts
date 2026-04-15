import { NextResponse } from 'next/server'
import { readRoomById, readAvailabilityByRoomId } from '@/lib/utils/data'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const room = readRoomById(id)
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    const availability = readAvailabilityByRoomId(id)
    return NextResponse.json({ room, availability })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 })
  }
}
