import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { track } from './lib/analytics'
import { hydrateSignedInUser } from './lib/services'
import './styles.css'

hydrateSignedInUser()
track('$pageview')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
