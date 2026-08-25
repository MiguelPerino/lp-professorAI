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

export type ProfessorUsage = {
  inputTokens: number
  cachedInputTokens: number
  outputTokens: number
  estimatedCostUsd: number
}

export type ProfessorChatResponse = {
  message: string
  provider: string
  model: string
  usage: ProfessorUsage
  disclaimerApplied: boolean
}

export type CurrentCycleUsage = {
  plan?: string
  cycleStartedAt?: string
  cycleEndsAt?: string
  requests?: number
  providerRequests?: number
  cacheRequests?: number
  inputTokens?: number
  cachedInputTokens?: number
  outputTokens?: number
  estimatedCostUsd?: number
  unpricedRequests?: number
  unknownUsageRequests?: number
}

type Csrf = { headerName: string; token: string }
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
  /** Must remain unset until the backend publishes the official refresh route. */
  refreshPath?: string
  fetch?: Fetch
}

function apiUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

async function responseError(response: Response): Promise<OfficialApiError> {
  const payload = await response.json().catch(() => null) as ErrorPayload | null
  return new OfficialApiError(
    payload?.message ?? payload?.error ?? 'A solicitação ao AçõesJá não pôde ser concluída.',
    response.status,
    payload?.code,
  )
}

function assertBaseUrl(baseUrl: string): string {
  if (!baseUrl.trim()) throw new Error('VITE_ACOESJA_API_BASE não foi configurada.')
  const url = new URL(baseUrl)
  const localDevelopment = ['localhost', '127.0.0.1'].includes(url.hostname)
  if (url.protocol !== 'https:' && !localDevelopment) {
    throw new Error('A API oficial deve usar HTTPS fora do desenvolvimento local.')
  }
  return baseUrl.replace(/\/$/, '')
}

function assertChatResponse(payload: unknown): ProfessorChatResponse {
  const response = payload as Partial<ProfessorChatResponse> | null
  const usage = response?.usage as Partial<ProfessorUsage> | undefined
  const validUsage = usage
    && ['inputTokens', 'cachedInputTokens', 'outputTokens', 'estimatedCostUsd']
      .every((key) => typeof usage[key as keyof ProfessorUsage] === 'number')
  if (!response || typeof response.message !== 'string' || !response.message.trim()
    || typeof response.provider !== 'string' || typeof response.model !== 'string'
    || typeof response.disclaimerApplied !== 'boolean' || !validUsage) {
    throw new OfficialApiError('O backend devolveu uma resposta de chat fora do contrato.', 502, 'AI_RESPONSE_CONTRACT_INVALID')
  }
  return response as ProfessorChatResponse
}

export class OfficialApiAdapter {
  private readonly baseUrl: string
  private readonly fetch: Fetch
  private readonly refreshPath?: string
  private csrf?: Csrf
  private refreshPromise?: Promise<void>

  constructor(options: OfficialApiOptions) {
    this.baseUrl = assertBaseUrl(options.baseUrl)
    this.fetch = options.fetch ?? globalThis.fetch.bind(globalThis)
    this.refreshPath = options.refreshPath?.trim() || undefined
  }

  async chat(request: ProfessorChatRequest): Promise<ProfessorChatResponse> {
    const response = await this.request<unknown>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    })
    return assertChatResponse(response)
  }

  async currentCycleUsage(): Promise<CurrentCycleUsage> {
    return this.request<CurrentCycleUsage>('/ai/usage/current-cycle')
  }

  private async getCsrf(force = false): Promise<Csrf> {
    if (this.csrf && !force) return this.csrf
    const response = await this.fetch(apiUrl(this.baseUrl, '/auth/csrf'), {
      method: 'GET',
      credentials: 'include',
      headers: { accept: 'application/json' },
    })
    if (!response.ok) throw await responseError(response)
    const payload = await response.json() as Partial<Csrf>
    if (!payload.headerName || !payload.token) {
      throw new OfficialApiError('O backend não devolveu um contrato CSRF válido.', 500, 'CSRF_CONTRACT_INVALID')
    }
    this.csrf = { headerName: payload.headerName, token: payload.token }
    return this.csrf
  }

  private async refresh(): Promise<void> {
    if (!this.refreshPath) {
      throw new OfficialApiError('Sua sessão precisa ser renovada pelo login oficial.', 401, 'LOGIN_REQUIRED')
    }
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        const csrf = await this.getCsrf()
        const response = await this.fetch(apiUrl(this.baseUrl, this.refreshPath!), {
          method: 'POST',
          credentials: 'include',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            [csrf.headerName]: csrf.token,
          },
        })
        if (!response.ok) throw await responseError(response)
        this.csrf = undefined
      })().finally(() => {
        this.refreshPromise = undefined
      })
    }
    return this.refreshPromise
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const execute = async (freshCsrf = false) => {
      const headers = new Headers(init.headers)
      headers.set('accept', 'application/json')
      if (init.body) headers.set('content-type', 'application/json')
      if (init.method && !['GET', 'HEAD'].includes(init.method.toUpperCase())) {
        const csrf = await this.getCsrf(freshCsrf)
        headers.set(csrf.headerName, csrf.token)
      }
      return this.fetch(apiUrl(this.baseUrl, path), { ...init, headers, credentials: 'include' })
    }

    let response = await execute()
    if (response.status === 401) {
      await this.refresh()
      response = await execute(true)
    }
    if (!response.ok) throw await responseError(response)
    return response.json() as Promise<T>
  }
}
