export const config = {
  acoesJaApiBase: (import.meta.env.VITE_ACOESJA_API_BASE?.trim() || '').replace(/\/$/, ''),
  professorRealEnabled: import.meta.env.VITE_PROFESSOR_REAL_ENABLED === 'true',
  posthogKey: import.meta.env.VITE_POSTHOG_KEY?.trim() ?? '',
  posthogHost: (import.meta.env.VITE_POSTHOG_HOST?.trim() || 'https://us.i.posthog.com').replace(/\/$/, ''),
  supabaseAnonKey:
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '',
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL?.trim() || '').replace(/\/$/, ''),
}

export const isSupabaseConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey)
export const isGitHubPagesPreview = typeof window !== 'undefined' && window.location.hostname.endsWith('.github.io')
export const isOfficialProfessorEnabled = config.professorRealEnabled && !isGitHubPagesPreview && Boolean(config.acoesJaApiBase)
