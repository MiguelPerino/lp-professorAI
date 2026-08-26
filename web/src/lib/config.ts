export const config = {
  professorApiBase: (
    import.meta.env.VITE_PROFESSOR_API_BASE?.trim()
      || 'https://api.acoesja.com.br/api/lp/professor'
  ).replace(/\/$/, ''),
  posthogToken: (
    import.meta.env.VITE_POSTHOG_PROJECT_TOKEN?.trim()
      || import.meta.env.VITE_POSTHOG_KEY?.trim()
      || ''
  ),
  posthogHost: (import.meta.env.VITE_POSTHOG_HOST?.trim() || 'https://us.i.posthog.com').replace(/\/$/, ''),
  supabaseAnonKey:
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '',
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL?.trim() || '').replace(/\/$/, ''),
}

export const isSupabaseConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey)
export const isProfessorEnabled = isSupabaseConfigured && Boolean(config.professorApiBase)
