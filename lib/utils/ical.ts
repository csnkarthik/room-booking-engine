import type { Booking } from '@/lib/types'

export function generateICalContent(booking: Booking): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const roomName = booking.room?.name ?? 'Hotel Room'

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LuxStay//Room Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.id}@luxstay.com`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${booking.checkIn.replace(/-/g, '')}`,
    `DTEND;VALUE=DATE:${booking.checkOut.replace(/-/g, '')}`,
    `SUMMARY:Hotel Stay - ${roomName}`,
    `DESCRIPTION:Booking #${booking.id}\\nRoom: ${roomName}\\nGuest: ${booking.guest.firstName} ${booking.guest.lastName}`,
    'LOCATION:LuxStay Hotel',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Check-in tomorrow',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}
