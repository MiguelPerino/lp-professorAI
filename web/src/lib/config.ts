const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {}

export const config = {
  professorApiBase: (
    env.VITE_PROFESSOR_API_BASE?.trim()
      || 'https://api.acoesja.com.br/api/lp/professor'
  ).replace(/\/$/, ''),
  posthogToken: (
    env.VITE_POSTHOG_PROJECT_TOKEN?.trim()
      || env.VITE_POSTHOG_KEY?.trim()
      || ''
  ),
  posthogHost: (env.VITE_POSTHOG_HOST?.trim() || 'https://us.i.posthog.com').replace(/\/$/, ''),
  supabaseAnonKey:
    env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || env.VITE_SUPABASE_ANON_KEY?.trim() || '',
  supabaseUrl: (env.VITE_SUPABASE_URL?.trim() || '').replace(/\/$/, ''),
}

export const isSupabaseConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey)
export const isProfessorEnabled = isSupabaseConfigured && Boolean(config.professorApiBase)
