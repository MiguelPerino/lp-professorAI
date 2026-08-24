import { config } from './config'

const distinctIdKey = 'acoesja_distinct_id'

function getDistinctId() {
  const existing = localStorage.getItem(distinctIdKey)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(distinctIdKey, id)
  return id
}

export function track(event: string, properties: Record<string, unknown> = {}) {
  if (!config.posthogKey) return

  void fetch(`${config.posthogHost}/capture/`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      api_key: config.posthogKey,
      event,
      properties: { distinct_id: getDistinctId(), ...properties },
    }),
  }).catch(() => undefined)
}

export function identify(userId: string, properties: Record<string, unknown> = {}) {
  if (!config.posthogKey) return
  localStorage.setItem(distinctIdKey, userId)
  track('$identify', { $set: properties })
}
