import { config, isOfficialProfessorEnabled, isSupabaseConfigured } from './config'
import { OfficialApiAdapter } from './officialApi'
import type { CurrentCycleUsage, ProfessorChatRequest, ProfessorChatResponse } from './officialApi'

function fail(message: string): never {
  throw new Error(message)
}

async function errorMessage(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null) as { error?: string; message?: string } | null
  return payload?.error ?? payload?.message ?? fallback
}

let officialApi: OfficialApiAdapter | undefined

function getOfficialApi(): OfficialApiAdapter {
  if (!isOfficialProfessorEnabled) fail('A integração real está desativada neste preview.')
  officialApi ??= new OfficialApiAdapter({
    baseUrl: config.acoesJaApiBase,
    refreshPath: config.acoesJaRefreshPath,
  })
  return officialApi
}

export function startOfficialLogin(): void {
  if (!config.acoesJaLoginUrl) fail('A URL oficial de login ainda não foi publicada no contrato.')
  const url = new URL(config.acoesJaLoginUrl)
  url.searchParams.set('returnTo', window.location.href)
  window.location.assign(url.toString())
}

export function openOfficialPolicies(): void {
  if (!config.acoesJaPoliciesUrl) fail('A URL oficial de aceite de políticas ainda não foi publicada no contrato.')
  window.location.assign(config.acoesJaPoliciesUrl)
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

export function askProfessor(request: ProfessorChatRequest): Promise<ProfessorChatResponse> {
  return getOfficialApi().chat(request)
}

export function getCurrentCycleUsage(): Promise<CurrentCycleUsage> {
  return getOfficialApi().currentCycleUsage()
}
