import { useEffect, useRef, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { completeAuthCallback, getAuthCallbackError } from './lib/services'
import { getAppBaseUrl, getAuthenticatedAreaUrl } from './lib/supabase'

export default function AuthCallback() {
  const started = useRef(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (started.current) return
    started.current = true

    const callbackError = getAuthCallbackError()
    if (callbackError) {
      setError(callbackError)
      return
    }

    void completeAuthCallback()
      .then(() => window.location.replace(getAuthenticatedAreaUrl()))
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'Não foi possível concluir seu acesso.')
      })
  }, [])

  return (
    <main className="auth-callback-page">
      <section className="auth-callback-card" aria-live="polite">
        {error ? (
          <>
            <span className="eyebrow">Professor IA</span>
            <h1>Não foi possível confirmar seu acesso.</h1>
            <p>{error}</p>
            <button className="button button-dark" onClick={() => window.location.replace(getAppBaseUrl())}>
              Voltar para o início
            </button>
          </>
        ) : (
          <>
            <LoaderCircle className="auth-callback-spinner" aria-hidden="true" />
            <h1>Confirmando seu acesso…</h1>
            <p>Aguarde enquanto recuperamos sua sessão com segurança.</p>
          </>
        )}
      </section>
    </main>
  )
}
