import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { config, isSupabaseConfigured } from './config'

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error('A autenticação ainda não foi configurada.')
  }

  client ??= createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  })

  return client
}

export function getAppBaseUrl(): string {
  return new URL(import.meta.env.BASE_URL, window.location.origin).toString()
}

export function getAuthCallbackUrl(): string {
  return new URL('auth/callback', getAppBaseUrl()).toString()
}

export function getAuthenticatedAreaUrl(): string {
  return `${getAppBaseUrl()}#perguntar`
}

export function isAuthCallbackRoute(): boolean {
  return window.location.pathname.replace(/\/+$/, '').endsWith('/auth/callback')
}
