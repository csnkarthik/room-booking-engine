import { fetchHospitalityToken } from './hospitalityToken'

interface CreateReservationParams {
  checkIn: string
  checkOut: string
  adults: number
  totalPrice: number
  roomTypeCode: string
  givenName: string
  surname: string
  emailAddress: string
  address: {
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    postalCode: string
    countryCode: string
  }
}

export interface GetReservationResult {
  operaReservationId: string
  operaConfirmationNumber: string
  guestName: string
  roomType: string
  arrivalDate: string
  departureDate: string
  adults: number
  amountBeforeTax: number
}

function getEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing env var: ${key}`)
  return val
}

function buildHeaders(token: string, hotelId: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'x-app-key': getEnv('HOSPITALITY_APP_KEY'),
    'x-hotelid': hotelId,
    'Content-Type': 'application/json',
  }
}

export async function createReservation(
  params: CreateReservationParams
): Promise<{ operaReservationId: string }> {
  const token = await fetchHospitalityToken()
  const baseUrl = getEnv('HOSPITALITY_API_BASE_URL')
  const hotelId = getEnv('HOSPITALITY_HOTEL_ID')
  const ratePlanCode = getEnv('HOSPITALITY_RATE_PLAN_CODE')

  const addressLines = [
    params.address.addressLine1,
    ...(params.address.addressLine2 ? [params.address.addressLine2] : []),
  ]

  const payload = {
    reservations: {
      reservation: {
        reservationGuests: [
          {
            profileInfo: {
              profile: {
                customer: {
                  personName: [
                    {
                      givenName: params.givenName,
                      surname: params.surname,
                      nameType: 'Primary',
                    },
                    { nameType: 'External' },
                  ],
                  language: 'E',
                },
                addresses: {
                  addressInfo: [
                    {
                      address: {
                        addressLine: addressLines,
                        cityName: params.address.city,
                        postalCode: params.address.postalCode,
                        state: params.address.state,
                        country: {
                          value:
                            params.address.countryCode === 'US'
                              ? 'USA'
                              : params.address.countryCode,
                          code: params.address.countryCode,
                        },
                        language: 'EN',
                        type: 'HOME',
                        primaryInd: true,
                      },
                    },
                  ],
                },
                emails: {
                  emailInfo: {
                    email: {
                      emailAddress: params.emailAddress,
                      type: 'HOME',
                      primaryInd: true,
                    },
                  },
                },
                profileType: 'Guest',
              },
            },
            primary: true,
          },
        ],
        reservationPaymentMethods: {
          paymentMethod: 'CA',
        },
        markAsRecentlyAccessed: true,
        hotelId,
        reservationStatus: 'Reserved',
        roomStay: {
          guarantee: {
            onHold: false,
            guaranteeCode: 'DEP',
          },
          roomRates: {
            sourceCode: hotelId,
            numberOfUnits: 1,
            rates: {
              rate: {
                start: params.checkIn,
                end: params.checkOut,
                base: {
                  amountBeforeTax: params.totalPrice,
                  currencyCode: 'USD',
                },
              },
            },
            start: params.checkIn,
            end: params.checkOut,
            marketCode: 'BASE',
            roomTypeCharged: params.roomTypeCode,
            ratePlanCode,
            roomType: params.roomTypeCode,
            pseudoRoom: false,
          },
          guestCounts: {
            children: 0,
            adults: params.adults,
          },
          departureDate: params.checkOut,
          arrivalDate: params.checkIn,
        },
      },
    },
    fetchInstructions: 'Reservation',
  }

  const res = await fetch(`${baseUrl}/rsv/v1/hotels/${hotelId}/reservations`, {
    method: 'POST',
    headers: buildHeaders(token, hotelId),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Opera createReservation failed (${res.status}): ${text}`)
  }

  const data = (await res.json()) as { links: Array<{ href: string; operationId: string }> }

  const getLink = data.links?.find((l) => l.operationId === 'getReservation')
  const operaReservationId = getLink?.href.split('/reservations/')[1]

  if (!operaReservationId) {
    throw new Error('Opera createReservation response did not include a reservation ID in links')
  }

  return { operaReservationId }
}

export async function getReservation(reservationId: string): Promise<GetReservationResult> {
  const token = await fetchHospitalityToken()
  const baseUrl = getEnv('HOSPITALITY_API_BASE_URL')
  const hotelId = getEnv('HOSPITALITY_HOTEL_ID')

  const res = await fetch(
    `${baseUrl}/rsv/v1/hotels/${hotelId}/reservations/${reservationId}?fetchInstructions=Reservation`,
    { headers: buildHeaders(token, hotelId) }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Opera getReservation failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  const reservation = data.reservations?.reservation?.[0]

  if (!reservation) {
    throw new Error('Opera getReservation response missing reservation data')
  }

  const idList: Array<{ id: string; type: string }> = reservation.reservationIdList ?? []
  const operaReservationId = idList.find((r) => r.type === 'Reservation')?.id ?? reservationId
  const operaConfirmationNumber = idList.find((r) => r.type === 'Confirmation')?.id ?? ''

  const primaryGuest = reservation.reservationGuests?.[0]?.profileInfo?.profile?.customer
  const personName = primaryGuest?.personName?.[0] ?? {}
  const guestName = [personName.givenName, personName.surname].filter(Boolean).join(' ')

  const roomStay = reservation.roomStay ?? {}
  const roomType = roomStay.currentRoomInfo?.roomType ?? ''
  const arrivalDate = roomStay.arrivalDate ?? ''
  const departureDate = roomStay.departureDate ?? ''
  const adults = roomStay.guestCounts?.adults ?? 0
  const amountBeforeTax = roomStay.total?.amountBeforeTax ?? 0

  return {
    operaReservationId,
    operaConfirmationNumber,
    guestName,
    roomType,
    arrivalDate,
    departureDate,
    adults,
    amountBeforeTax,
  }
}
