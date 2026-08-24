import { createServer } from 'node:http'
import type { IncomingMessage, ServerResponse } from 'node:http'

type Json = Record<string, unknown>
type SupabaseUser = { id: string; email?: string }

const port = Number(process.env.PORT ?? 8787)
const supabaseUrl = requiredEnv('SUPABASE_URL')
const supabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY?.trim() || process.env.SUPABASE_ANON_KEY?.trim() || ''
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || ''
const professorApiUrl = process.env.PROFESSOR_API_URL ?? process.env.PROFESSOR_BACKEND_URL
const professorApiKey = process.env.PROFESSOR_API_KEY ?? process.env.PROFESSOR_BACKEND_SECRET
const dailyLimit = Number(process.env.PROFESSOR_DAILY_QUESTION_LIMIT ?? 5)
const allowedOrigins: string[] = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin: string) => origin.trim())
  .filter(Boolean)

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`Variável obrigatória ausente: ${name}`)
  }
  return value ?? ''
}

function setCors(request: IncomingMessage, response: ServerResponse): void {
  const origin = request.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin)
    response.setHeader('Vary', 'Origin')
  }
  response.setHeader('Access-Control-Allow-Headers', 'authorization, content-type')
  response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET')
}

function send(response: ServerResponse, status: number, body: Json): void {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  response.end(JSON.stringify(body))
}

async function readJson(request: IncomingMessage): Promise<Json> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const data = Buffer.from(chunk)
    size += data.length
    if (size > 32_000) throw new Error('Payload muito grande')
    chunks.push(data)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Json
  } catch {
    throw new Error('JSON inválido')
  }
}

async function getUser(accessToken: string): Promise<SupabaseUser | null> {
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: supabasePublishableKey, authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) return null
  return (await response.json()) as SupabaseUser
}

async function callSupabaseRpc<T>(name: string, body: Json): Promise<T> {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      ...serviceAuthenticationHeaders(),
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`Supabase RPC ${name} indisponível`)
  return (await response.json()) as T
}

async function persistConversation(userId: string, question: string, answer: string): Promise<string> {
  const conversationResponse = await fetch(`${supabaseUrl}/rest/v1/professor_conversations`, {
    method: 'POST',
    headers: serviceHeaders('return=representation'),
    body: JSON.stringify({ user_id: userId, title: question.slice(0, 120) }),
  })
  if (!conversationResponse.ok) throw new Error('Não foi possível salvar a conversa')
  const [conversation] = (await conversationResponse.json()) as Array<{ id: string }>

  const messagesResponse = await fetch(`${supabaseUrl}/rest/v1/professor_messages`, {
    method: 'POST',
    headers: serviceHeaders(),
    body: JSON.stringify([
      { conversation_id: conversation.id, role: 'user', content: question },
      { conversation_id: conversation.id, role: 'assistant', content: answer },
    ]),
  })
  if (!messagesResponse.ok) throw new Error('Não foi possível salvar as mensagens')
  return conversation.id
}

function serviceHeaders(prefer = 'return=minimal'): Record<string, string> {
  return {
    ...serviceAuthenticationHeaders(),
    'content-type': 'application/json',
    Prefer: prefer,
  }
}

function serviceAuthenticationHeaders(): Record<string, string> {
  return {
    apikey: supabaseSecretKey,
    ...(supabaseSecretKey.startsWith('sb_secret_')
      ? {}
      : { authorization: `Bearer ${supabaseSecretKey}` }),
  }
}

function getAnswer(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const source = payload as Record<string, unknown>
  for (const key of ['answer', 'response', 'output_text', 'content', 'text']) {
    if (typeof source[key] === 'string' && source[key].trim()) return source[key].trim()
  }
  return null
}

async function askProfessor(question: string, userId: string): Promise<string> {
  if (!professorApiUrl) throw new Error('Professor IA ainda não está configurado')
  const response = await fetch(professorApiUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(professorApiKey ? { authorization: `Bearer ${professorApiKey}` } : {}),
    },
    body: JSON.stringify({
      question,
      user_id: userId,
      guardrails: ['educational_only', 'no_investment_recommendations'],
    }),
  })
  if (!response.ok) throw new Error('O Professor IA não conseguiu responder agora')
  const answer = getAnswer(await response.json())
  if (!answer) throw new Error('Resposta inválida do Professor IA')
  return answer
}

const server = createServer(async (request: IncomingMessage, response: ServerResponse) => {
  setCors(request, response)
  if (request.method === 'OPTIONS') return response.writeHead(204).end()
  if (request.method === 'GET' && request.url === '/health') {
    return send(response, 200, { ok: true, service: 'acoesja-professor-api' })
  }
  if (request.method !== 'POST' || request.url !== '/v1/professor/ask') {
    return send(response, 404, { error: 'Rota não encontrada' })
  }

  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return send(response, 401, { error: 'Autenticação necessária' })
  }

  const missingConfiguration = [
    !supabaseUrl && 'SUPABASE_URL',
    !supabasePublishableKey && 'SUPABASE_PUBLISHABLE_KEY (ou SUPABASE_ANON_KEY)',
    !supabaseSecretKey && 'SUPABASE_SECRET_KEY (ou SUPABASE_SERVICE_ROLE_KEY)',
  ].filter((name): name is string => Boolean(name))

  if (missingConfiguration.length > 0) {
    return send(response, 503, {
      error: `Servidor não configurado: ${missingConfiguration.join(', ')}`,
    })
  }

  try {
    const user = await getUser(token)
    if (!user) return send(response, 401, { error: 'Sessão inválida ou expirada' })

    const body = await readJson(request)
    const question = typeof body.question === 'string' ? body.question.trim() : ''
    if (question.length < 3 || question.length > 2_000) {
      return send(response, 400, { error: 'A pergunta deve ter entre 3 e 2.000 caracteres' })
    }

    const reserved = await callSupabaseRpc<boolean>('reserve_professor_question', {
      p_user_id: user.id,
      p_limit: dailyLimit,
    })
    if (!reserved) return send(response, 429, { error: 'Você atingiu o limite de perguntas de hoje' })

    try {
      const answer = await askProfessor(question, user.id)
      const conversationId = await persistConversation(user.id, question, answer)
      return send(response, 200, { answer, conversationId })
    } catch (error) {
      await callSupabaseRpc<void>('release_professor_question', { p_user_id: user.id })
      throw error
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível processar a pergunta'
    return send(response, 502, { error: message })
  }
})

server.listen(port, () => {
  console.info(`Professor API disponível em http://localhost:${port}`)
})
