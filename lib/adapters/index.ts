import type { DataAdapter } from './types'
import { JsonAdapter } from './JsonAdapter'

/**
 * Returns the correct adapter based on DATA_SOURCE env var.
 * Default: json
 * Future: set DATA_SOURCE=api to use ApiAdapter
 */
export function getDataAdapter(): DataAdapter {
  const source = process.env.DATA_SOURCE ?? 'json'

  if (source === 'json') {
    return new JsonAdapter()
  }

  throw new Error(
    `Unknown DATA_SOURCE: "${source}". Supported values: "json". Add an ApiAdapter and register it here.`
  )
}

export type { DataAdapter } from './types'
