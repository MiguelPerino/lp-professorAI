export type ProfessorContextItem = {
  id: string
  type: string
  ticker: string
  label: string
  value: string
  period: string
  source: string
  displayText: string
}

export type ProfessorChatRequest = {
  message: string
  conversationId?: string
  contextItems: ProfessorContextItem[]
}

export type ProfessorChatResponse = {
  message: string
  conversationId: string
}

type BackendProfessorResponse = {
  answer?: unknown
  conversationId?: unknown
}

type ErrorPayload = { code?: string; error?: string; message?: string }
type Fetch = typeof globalThis.fetch

export class OfficialApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(
    message: string,
    status: number,
    code?: string,
  ) {
    super(message)
    this.name = 'OfficialApiError'
    this.status = status
    this.code = code
  }
}

export type OfficialApiOptions = {
  baseUrl: string
  fetch?: Fetch
}

function apiUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

function errorCode(status: number, payload: ErrorPayload | null): string | undefined {
  if (payload?.code) return payload.code
  if (status === 401) return 'LOGIN_REQUIRED'
  if (status === 429) return 'AI_DAILY_LIMIT_REACHED'
  if (status >= 500) return 'AI_PROVIDER_UNAVAILABLE'
  return undefined
}

async function responseError(response: Response): Promise<OfficialApiError> {
  const payload = await response.json().catch(() => null) as ErrorPayload | null
  return new OfficialApiError(
    payload?.message ?? payload?.error ?? 'A solicitação ao Professor IA não pôde ser concluída.',
    response.status,
    errorCode(response.status, payload),
  )
}

function assertBaseUrl(baseUrl: string): string {
  if (!baseUrl.trim()) throw new Error('VITE_ACOESJA_API_BASE não foi configurada.')
  const url = new URL(baseUrl)
  const localDevelopment = ['localhost', '127.0.0.1'].includes(url.hostname)
  if (url.protocol !== 'https:' && !localDevelopment) {
    throw new Error('A API do Professor deve usar HTTPS fora do desenvolvimento local.')
  }
  return baseUrl.replace(/\/$/, '')
}

function assertChatResponse(payload: BackendProfessorResponse): ProfessorChatResponse {
  if (typeof payload.answer !== 'string' || !payload.answer.trim()
    || typeof payload.conversationId !== 'string' || !payload.conversationId) {
    throw new OfficialApiError(
      'O backend devolveu uma resposta fora do contrato esperado.',
      502,
      'AI_RESPONSE_CONTRACT_INVALID',
    )
  }
  return { message: payload.answer.trim(), conversationId: payload.conversationId }
}

export class OfficialApiAdapter {
  private readonly baseUrl: string
  private readonly fetch: Fetch

  constructor(options: OfficialApiOptions) {
    this.baseUrl = assertBaseUrl(options.baseUrl)
    this.fetch = options.fetch ?? globalThis.fetch.bind(globalThis)
  }

  async chat(request: ProfessorChatRequest, accessToken: string): Promise<ProfessorChatResponse> {
    if (!accessToken) {
      throw new OfficialApiError('Entre com seu e-mail para continuar.', 401, 'LOGIN_REQUIRED')
    }
    const response = await this.fetch(apiUrl(this.baseUrl, '/v1/professor/ask'), {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ question: request.message }),
    })
    if (!response.ok) throw await responseError(response)
    return assertChatResponse(await response.json() as BackendProfessorResponse)
  }
}
