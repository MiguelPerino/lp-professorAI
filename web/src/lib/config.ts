export const config = {
  posthogKey: import.meta.env.VITE_POSTHOG_KEY?.trim() ?? '',
  posthogHost: (import.meta.env.VITE_POSTHOG_HOST?.trim() || 'https://us.i.posthog.com').replace(/\/$/, ''),
  serverUrl: (import.meta.env.VITE_SERVER_URL?.trim() || 'http://localhost:8787').replace(/\/$/, ''),
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '',
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL?.trim() || '').replace(/\/$/, ''),
}

export const isSupabaseConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey)
