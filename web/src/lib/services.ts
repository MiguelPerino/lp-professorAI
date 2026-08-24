import type { AuthError, Session } from '@supabase/supabase-js'
import { identify } from './analytics'
import { config, isSupabaseConfigured } from './config'
import { getAuthCallbackUrl, getSupabaseClient } from './supabase'

function fail(message: string): never {
  throw new Error(message)
}

async function errorMessage(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null) as { error?: string; message?: string } | null
  return payload?.error ?? payload?.message ?? fallback
}

function friendlyAuthError(error: AuthError): string {
  const detail = import.meta.env.DEV && error.code ? ` Código: ${error.code}.` : ''

  if (error.code === 'over_email_send_rate_limit') {
    return `O Supabase bloqueou temporariamente novos envios para este e-mail. Aguarde o intervalo configurado em Authentication → Rate Limits antes de tentar novamente.${detail}`
  }
  if (error.code === 'over_request_rate_limit') {
    return `Muitas solicitações de autenticação partiram desta conexão. Aguarde alguns minutos e tente novamente.${detail}`
  }
  if (error.code === 'email_address_not_authorized') {
    return `O provedor de e-mail padrão do Supabase não está autorizado a enviar para este endereço. Use um e-mail membro da organização ou configure SMTP próprio.${detail}`
  }
  if (error.status === 429) {
    return `A cota de autenticação por e-mail do projeto foi atingida. Verifique Authentication → Rate Limits no Supabase.${detail}`
  }
  return `Não foi possível enviar o link de acesso. Verifique o e-mail e tente novamente.${detail}`
}

export async function requestMagicLink(email: string): Promise<void> {
  const { error } = await getSupabaseClient().auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getAuthCallbackUrl(),
    },
  })
  if (error) fail(friendlyAuthError(error))
}

export function startGoogleLogin() {
  if (!isSupabaseConfigured) fail('A autenticação ainda não foi configurada.')
  const url = new URL(`${config.supabaseUrl}/auth/v1/authorize`)
  url.searchParams.set('provider', 'google')
  url.searchParams.set('redirect_to', getAuthCallbackUrl())
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
  const { data, error } = await getSupabaseClient().auth.getSession()
  if (error || !data.session) fail('Faça login para enviar uma pergunta ao Professor.')
  const response = await fetch(`${config.serverUrl}/v1/professor/ask`, {
    method: 'POST',
    headers: { authorization: `Bearer ${data.session.access_token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  const payload = await response.json().catch(() => null) as { answer?: string; error?: string; conversationId?: string } | null
  if (!response.ok || !payload?.answer) fail(payload?.error ?? 'O Professor não conseguiu responder agora.')
  return { answer: payload.answer, conversationId: payload.conversationId }
}

function identifySession(session: Session | null): void {
  if (session?.user) identify(session.user.id, { email: session.user.email })
}

export function hydrateSignedInUser(): void {
  if (!isSupabaseConfigured) return
  const supabase = getSupabaseClient()

  void supabase.auth.getSession()
    .then(({ data }) => identifySession(data.session))
    .catch(() => undefined)

  supabase.auth.onAuthStateChange((_event, session) => identifySession(session))
}

export function getAuthCallbackError(): string | null {
  const query = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const code = query.get('error_code') ?? hash.get('error_code')
  if (code === 'otp_expired') return 'Este link expirou ou já foi utilizado. Solicite um novo link de acesso.'
  const description = query.get('error_description') ?? hash.get('error_description')
  if (description) return description
  if (query.has('error') || hash.has('error')) return 'O link é inválido ou expirou. Solicite um novo link de acesso.'
  return null
}

export async function completeAuthCallback(): Promise<Session> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) fail('Não foi possível recuperar sua sessão. Solicite um novo link de acesso.')
  if (data.session) return data.session

  return new Promise<Session>((resolve, reject) => {
    let unsubscribe: () => void = () => undefined
    const timeout = window.setTimeout(() => {
      unsubscribe()
      reject(new Error('O link é inválido ou expirou. Solicite um novo link de acesso.'))
    }, 8_000)

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) return
      window.clearTimeout(timeout)
      unsubscribe()
      resolve(session)
    })
    unsubscribe = () => listener.subscription.unsubscribe()
  })
}
