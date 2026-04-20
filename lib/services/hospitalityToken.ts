interface TokenCache {
  accessToken: string
  expiresAt: number
}

let cache: TokenCache | null = null

export async function fetchHospitalityToken(): Promise<string> {
  if (cache && Date.now() < cache.expiresAt) return cache.accessToken

  const res = await fetch(`${process.env.HOSPITALITY_API_BASE_URL}/oauth/v1/tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-app-key': process.env.HOSPITALITY_APP_KEY!,
      enterpriseId: process.env.HOSPITALITY_ENTERPRISE_ID!,
      Authorization: `Basic ${process.env.HOSPITALITY_OAUTH_BASIC!}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: process.env.HOSPITALITY_OAUTH_SCOPE!,
    }).toString(),
  })

  if (!res.ok) throw new Error(`Token fetch failed (${res.status}): ${await res.text()}`)

  const data = (await res.json()) as { access_token: string; expires_in: number }
  cache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }
  return cache.accessToken
}
