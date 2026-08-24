import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AuthCallback from './AuthCallback'
import { track } from './lib/analytics'
import { hydrateSignedInUser } from './lib/services'
import { isAuthCallbackRoute } from './lib/supabase'
import './styles.css'

hydrateSignedInUser()
track('$pageview')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAuthCallbackRoute() ? <AuthCallback /> : <App />}
  </StrictMode>,
)
