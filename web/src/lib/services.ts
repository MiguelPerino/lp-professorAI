import { identify } from './analytics'
import { config, isSupabaseConfigured } from './config'

type ApiError = { message: string }

function fail(message: string): never {
  throw { message } satisfies ApiError
}

async function errorMessage(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null) as { error?: string; message?: string } | null
  return payload?.error ?? payload?.message ?? fallback
}

export function getAccessToken() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return params.get('access_token')
}

export async function requestMagicLink(email: string) {
  if (!isSupabaseConfigured) fail('A autenticação ainda não foi configurada.')
  const response = await fetch(`${config.supabaseUrl}/auth/v1/otp`, {
    method: 'POST',
    headers: { apikey: config.supabaseAnonKey, 'content-type': 'application/json' },
    body: JSON.stringify({ email, create_user: true, options: { emailRedirectTo: window.location.origin } }),
  })
  if (!response.ok) fail(await errorMessage(response, 'Não foi possível enviar o link de acesso.'))
}

export function startGoogleLogin() {
  if (!isSupabaseConfigured) fail('A autenticação ainda não foi configurada.')
  const url = new URL(`${config.supabaseUrl}/auth/v1/authorize`)
  url.searchParams.set('provider', 'google')
  url.searchParams.set('redirect_to', window.location.origin)
  window.location.assign(url.toString())
}

export async function joinWaitlist(input: { name: string; email: string; whatsapp: string; marketingConsent: boolean }) {
  if (!isSupabaseConfigured) fail('A lista de lançamento ainda não foi configurada.')
  const query = new URLSearchParams(window.location.search)
  const attribution = Object.fromEntries(
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
      .filter((key) => query.has(key))
      .map((key) => [key, query.get(key)]),
  )
  const response = await fetch(`${config.supabaseUrl}/rest/v1/rpc/join_launch_waitlist`, {
    method: 'POST',
    headers: { apikey: config.supabaseAnonKey, 'content-type': 'application/json' },
    body: JSON.stringify({
      p_email: input.email.toLowerCase().trim(),
      p_full_name: input.name,
      p_whatsapp: input.whatsapp,
      p_marketing_consent: input.marketingConsent,
      p_attribution: attribution,
    }),
  })
  if (!response.ok) fail(await errorMessage(response, 'Não foi possível cadastrar seu e-mail.'))
}

export async function askProfessor(question: string): Promise<{ answer: string; conversationId?: string }> {
  const accessToken = getAccessToken()
  if (!accessToken) fail('Faça login para enviar uma pergunta ao Professor.')
  const response = await fetch(`${config.serverUrl}/v1/professor/ask`, {
    method: 'POST',
    headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  const payload = await response.json().catch(() => null) as { answer?: string; error?: string; conversationId?: string } | null
  if (!response.ok || !payload?.answer) fail(payload?.error ?? 'O Professor não conseguiu responder agora.')
  return { answer: payload.answer, conversationId: payload.conversationId }
}

export function hydrateSignedInUser() {
  const token = getAccessToken()
  if (!token || !isSupabaseConfigured) return
  void fetch(`${config.supabaseUrl}/auth/v1/user`, { headers: { apikey: config.supabaseAnonKey, authorization: `Bearer ${token}` } })
    .then(async (response) => response.ok ? response.json() as Promise<{ id: string; email?: string }> : null)
    .then((user) => user && identify(user.id, { email: user.email }))
    .catch(() => undefined)
}
