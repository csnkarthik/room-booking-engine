'use client'

import { useQuery } from '@tanstack/react-query'

export function useCalendarPricing(
  roomTypeCode: string | undefined,
  guests: number,
  startDate: string,
  endDate: string
): { dailyPrices: Record<string, number>; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ['pricing', roomTypeCode, guests, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({ startDate, endDate, guests: String(guests) })
      if (roomTypeCode) params.set('roomTypeCode', roomTypeCode)
      const res = await fetch(`/api/pricing?${params.toString()}`)
      if (!res.ok) throw new Error('Pricing fetch failed')
      const json = (await res.json()) as { prices: Record<string, number> }
      return json.prices
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: {},
  })

  return { dailyPrices: data ?? {}, isLoading }
}
