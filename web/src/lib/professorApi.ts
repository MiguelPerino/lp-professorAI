export type ProfessorChatRequest = {
  message: string
  conversationId?: string
}

export type ProfessorUsage = {
  cycleStart: string
  cycleEnd: string
  requestCount: number
  providerCallCount: number
  cacheHitCount: number
  inputTokens: number
  cachedInputTokens: number
  outputTokens: number
  estimatedCostUsd: number
  unpricedRequestCount: number
  unknownUsageRequestCount: number
  dailyCallLimit: number
  callsToday: number
}

export type ProfessorChatResponse = {
  message: string
  provider: string
  model: string
  usage: {
    inputTokens: number | null
    cachedInputTokens: number | null
    outputTokens: number | null
    estimatedCostUsd: number | null
  } | null
  disclaimerApplied: boolean
}

type ErrorPayload = { code?: string; error?: string; message?: string }
type Fetch = typeof globalThis.fetch

export class ProfessorApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly retryAfterSeconds?: number

  constructor(message: string, status: number, code?: string, retryAfterSeconds?: number) {
    super(message)
    this.name = 'ProfessorApiError'
    this.status = status
    this.code = code
    this.retryAfterSeconds = retryAfterSeconds
  }
}

export type ProfessorApiOptions = {
  baseUrl: string
  fetch?: Fetch
}

function apiUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

function errorCode(status: number, payload: ErrorPayload | null): string | undefined {
  if (payload?.error) return payload.error
  if (payload?.code) return payload.code
  if (status === 401) return 'LOGIN_REQUIRED'
  if (status === 429) return 'AI_DAILY_LIMIT_REACHED'
  if (status >= 500) return 'AI_PROVIDER_UNAVAILABLE'
  return undefined
}

async function responseError(response: Response): Promise<ProfessorApiError> {
  const payload = await response.json().catch(() => null) as ErrorPayload | null
  const retryAfter = Number(response.headers.get('retry-after'))
  return new ProfessorApiError(
    payload?.message ?? 'A solicitação ao Professor IA não pôde ser concluída.',
    response.status,
    errorCode(response.status, payload),
    Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
  )
}

function assertBaseUrl(baseUrl: string): string {
  if (!baseUrl.trim()) throw new Error('VITE_PROFESSOR_API_BASE não foi configurada.')
  const url = new URL(baseUrl)
  const localDevelopment = ['localhost', '127.0.0.1'].includes(url.hostname)
  if (url.protocol !== 'https:' && !localDevelopment) {
    throw new Error('A API do Professor deve usar HTTPS fora do desenvolvimento local.')
  }
  return baseUrl.replace(/\/$/, '')
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function assertChatResponse(payload: unknown): ProfessorChatResponse {
  if (!payload || typeof payload !== 'object') throw invalidContract()
  const source = payload as Record<string, unknown>
  if (typeof source.message !== 'string' || !source.message.trim()
    || typeof source.provider !== 'string' || typeof source.model !== 'string'
    || typeof source.disclaimerApplied !== 'boolean') {
    throw invalidContract()
  }
  const usageSource = source.usage
  let usage: ProfessorChatResponse['usage'] = null
  if (usageSource !== null && usageSource !== undefined) {
    if (typeof usageSource !== 'object') throw invalidContract()
    const measured = usageSource as Record<string, unknown>
    for (const field of ['inputTokens', 'cachedInputTokens', 'outputTokens', 'estimatedCostUsd']) {
      if (measured[field] !== null && measured[field] !== undefined && !isNumber(measured[field])) {
        throw invalidContract()
      }
    }
    usage = {
      inputTokens: measured.inputTokens as number | null ?? null,
      cachedInputTokens: measured.cachedInputTokens as number | null ?? null,
      outputTokens: measured.outputTokens as number | null ?? null,
      estimatedCostUsd: measured.estimatedCostUsd as number | null ?? null,
    }
  }
  return {
    message: source.message.trim(),
    provider: source.provider,
    model: source.model,
    usage,
    disclaimerApplied: source.disclaimerApplied,
  }
}

function assertUsage(payload: unknown): ProfessorUsage {
  if (!payload || typeof payload !== 'object') throw invalidContract()
  const source = payload as Record<string, unknown>
  const numericFields = [
    'requestCount', 'providerCallCount', 'cacheHitCount', 'inputTokens', 'cachedInputTokens',
    'outputTokens', 'estimatedCostUsd', 'unpricedRequestCount', 'unknownUsageRequestCount',
    'dailyCallLimit', 'callsToday',
  ]
  if (typeof source.cycleStart !== 'string' || typeof source.cycleEnd !== 'string'
    || numericFields.some((field) => !isNumber(source[field]))) {
    throw invalidContract()
  }
  return source as ProfessorUsage
}

function invalidContract() {
  return new ProfessorApiError(
    'O backend devolveu uma resposta fora do contrato esperado.',
    502,
    'AI_RESPONSE_CONTRACT_INVALID',
  )
}

export class ProfessorApi {
  private readonly baseUrl: string
  private readonly fetch: Fetch

  constructor(options: ProfessorApiOptions) {
    this.baseUrl = assertBaseUrl(options.baseUrl)
    this.fetch = options.fetch ?? globalThis.fetch.bind(globalThis)
  }

  async chat(request: ProfessorChatRequest, accessToken: string): Promise<ProfessorChatResponse> {
    const response = await this.request('/chat', accessToken, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
    })
    return assertChatResponse(await response.json())
  }

  async currentUsage(accessToken: string): Promise<ProfessorUsage> {
    const response = await this.request('/usage/current-cycle', accessToken, { method: 'GET' })
    return assertUsage(await response.json())
  }

  private async request(path: string, accessToken: string, init: RequestInit): Promise<Response> {
    if (!accessToken) {
      throw new ProfessorApiError('Entre com seu e-mail para continuar.', 401, 'LOGIN_REQUIRED')
    }
    const headers = new Headers(init.headers)
    headers.set('accept', 'application/json')
    headers.set('authorization', `Bearer ${accessToken}`)
    const response = await this.fetch(apiUrl(this.baseUrl, path), {
      ...init,
      credentials: 'omit',
      headers,
    })
    if (!response.ok) throw await responseError(response)
    return response
  }
}
