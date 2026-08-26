import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PostHogProvider } from '@posthog/react'
import App from './App'
import { config } from './lib/config'
import './styles.css'

const posthogOptions = {
  api_host: config.posthogHost,
  defaults: '2026-05-30',
  autocapture: true,
  capture_pageview: true,
  capture_pageleave: true,
  capture_heatmaps: true,
  session_recording: {
    // Perguntas, e-mails e outros campos digitados não aparecem nas gravações.
    maskAllInputs: true,
  },
} as const

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider apiKey={config.posthogToken} options={posthogOptions}>
      <App />
    </PostHogProvider>
  </StrictMode>,
)
