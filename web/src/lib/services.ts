import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { config, isProfessorEnabled, isSupabaseConfigured } from './config'
import { ProfessorApi, ProfessorApiError } from './professorApi'
import type { ProfessorChatRequest, ProfessorChatResponse, ProfessorUsage } from './professorApi'

function fail(message: string): never {
  throw new Error(message)
}

async function errorMessage(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null) as { error?: string; message?: string } | null
  return payload?.error ?? payload?.message ?? fallback
}

let professorApi: ProfessorApi | undefined
let supabase: SupabaseClient | undefined

function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) fail('A autenticação do Supabase ainda não foi configurada.')
  supabase ??= createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: { detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
  })
  return supabase
}

function getProfessorApi(): ProfessorApi {
  if (!isProfessorEnabled) fail('A integração real ainda não foi configurada.')
  professorApi ??= new ProfessorApi({ baseUrl: config.professorApiBase })
  return professorApi
}

export async function initializeProfessorAuth(): Promise<boolean> {
  if (!isProfessorEnabled) return false
  const { data, error } = await getSupabase().auth.getSession()
  if (error) throw error
  return Boolean(data.session?.access_token)
}

export async function hasProfessorSession(): Promise<boolean> {
  const { data, error } = await getSupabase().auth.getSession()
  if (error) throw error
  return Boolean(data.session?.access_token)
}

export async function getProfessorUserId(): Promise<string | null> {
  const { data, error } = await getSupabase().auth.getSession()
  if (error) throw error
  return data.session?.user.id ?? null
}

export async function sendProfessorOtp(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) fail('Informe seu e-mail para entrar.')
  const { error } = await getSupabase().auth.signInWithOtp({
    email: normalizedEmail,
  })
  if (error) throw error
}

export async function verifyProfessorOtp(email: string, token: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase()
  const { data, error } = await getSupabase().auth.verifyOtp({
    email: normalizedEmail,
    token,
    type: 'email',
  })
  if (error) throw error
  if (!data.session?.access_token) fail('O código foi aceito, mas não foi possível iniciar sua sessão.')
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
    throw new ProfessorApiError('Entre com seu e-mail para continuar.', 401, 'LOGIN_REQUIRED')
  }
  return getProfessorApi().chat(request, accessToken)
}

export async function getProfessorUsage(): Promise<ProfessorUsage> {
  const { data, error } = await getSupabase().auth.getSession()
  if (error) throw error
  const accessToken = data.session?.access_token
  if (!accessToken) throw new ProfessorApiError('Entre com seu e-mail para continuar.', 401, 'LOGIN_REQUIRED')
  return getProfessorApi().currentUsage(accessToken)
}
