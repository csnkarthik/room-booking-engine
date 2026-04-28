'use client'

import { AddressAutofill as MapboxAutofill } from '@mapbox/search-js-react'
import { Input } from '@/components/ui/input'

interface AutofillSelection {
  primary_line: string
  city: string
  state: string
  zip_code: string
}

interface AddressAutofillProps {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  onSelect: (suggestion: AutofillSelection) => void
  hasError?: boolean
  id?: string
}

export function AddressAutofill({
  value,
  onChange,
  onBlur,
  onSelect,
  hasError,
  id,
}: AddressAutofillProps) {
  return (
    <MapboxAutofill
      accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
      onRetrieve={(res) => {
        const props = res.features[0]?.properties
        if (!props) return
        onChange(props.address_line1 ?? '')
        onSelect({
          primary_line: props.address_line1 ?? '',
          city: props.address_level2 ?? '',
          state: props.address_level1 ?? '',
          zip_code: props.postcode ?? '',
        })
      }}
    >
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder="123 Main St"
        aria-invalid={hasError}
        autoComplete="address-line1"
      />
    </MapboxAutofill>
  )
}
