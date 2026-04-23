import { NextResponse } from 'next/server'
import { readRooms } from '@/lib/utils/data'

export async function GET() {
  try {
    const rooms = readRooms()
    return NextResponse.json(rooms)
  } catch (err) {
    console.error('[/api/rooms] GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}
