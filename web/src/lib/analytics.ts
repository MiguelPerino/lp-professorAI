import { config } from './config'

// Efêmero por carregamento: a LP não cria nem persiste identidade local.
const anonymousPageId = crypto.randomUUID()

export function track(event: string, properties: Record<string, unknown> = {}) {
  if (!config.posthogKey) return

  void fetch(`${config.posthogHost}/capture/`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      api_key: config.posthogKey,
      event,
      properties: { distinct_id: anonymousPageId, ...properties },
    }),
  }).catch(() => undefined)
}
