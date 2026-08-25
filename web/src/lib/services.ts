import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { config, isOfficialProfessorEnabled, isSupabaseConfigured } from './config'
import { OfficialApiAdapter, OfficialApiError } from './officialApi'
import type { ProfessorChatRequest, ProfessorChatResponse } from './officialApi'

function fail(message: string): never {
  throw new Error(message)
}

async function errorMessage(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null) as { error?: string; message?: string } | null
  return payload?.error ?? payload?.message ?? fallback
}

let officialApi: OfficialApiAdapter | undefined
let supabase: SupabaseClient | undefined

function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) fail('A autenticação do Supabase ainda não foi configurada.')
  supabase ??= createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: { detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
  })
  return supabase
}

function getOfficialApi(): OfficialApiAdapter {
  if (!isOfficialProfessorEnabled) fail('A integração real está desativada neste preview.')
  officialApi ??= new OfficialApiAdapter({ baseUrl: config.acoesJaApiBase })
  return officialApi
}

export async function hasProfessorSession(): Promise<boolean> {
  const { data, error } = await getSupabase().auth.getSession()
  if (error) throw error
  return Boolean(data.session?.access_token)
}

export async function sendProfessorLoginLink(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) fail('Informe seu e-mail para entrar.')
  const { error } = await getSupabase().auth.signInWithOtp({
    email: normalizedEmail,
    options: { emailRedirectTo: `${window.location.origin}${window.location.pathname}` },
  })
  if (error) throw error
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

export async function askProfessor(request: ProfessorChatRequest): Promise<ProfessorChatResponse> {
  const { data, error } = await getSupabase().auth.getSession()
  if (error) throw error
  const accessToken = data.session?.access_token
  if (!accessToken) {
    throw new OfficialApiError('Entre com seu e-mail para continuar.', 401, 'LOGIN_REQUIRED')
  }
  return getOfficialApi().chat(request, accessToken)
}
