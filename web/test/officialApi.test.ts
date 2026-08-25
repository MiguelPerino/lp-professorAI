import assert from 'node:assert/strict'
import test from 'node:test'
import { OfficialApiAdapter, OfficialApiError } from '../src/lib/officialApi.ts'

test('envia a pergunta ao BFF com o token Supabase', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = []
  const adapter = new OfficialApiAdapter({
    baseUrl: 'https://backend.example.com',
    fetch: async (input, init) => {
      calls.push({ url: String(input), init })
      return Response.json({ answer: 'Resposta educacional.', conversationId: 'conversation-id' })
    },
  })

  const response = await adapter.chat({ message: 'Pergunta', contextItems: [] }, 'access-token')

  assert.deepEqual(response, { message: 'Resposta educacional.', conversationId: 'conversation-id' })
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'https://backend.example.com/v1/professor/ask')
  assert.equal(new Headers(calls[0].init?.headers).get('authorization'), 'Bearer access-token')
  assert.deepEqual(JSON.parse(String(calls[0].init?.body)), { question: 'Pergunta' })
})

test('exige uma sessão antes de chamar o backend', async () => {
  let called = false
  const adapter = new OfficialApiAdapter({
    baseUrl: 'https://backend.example.com',
    fetch: async () => { called = true; return Response.json({}) },
  })

  await assert.rejects(
    adapter.chat({ message: 'Pergunta', contextItems: [] }, ''),
    (error: unknown) => error instanceof OfficialApiError && error.code === 'LOGIN_REQUIRED',
  )
  assert.equal(called, false)
})

test('mapeia limite diário devolvido pelo backend', async () => {
  const adapter = new OfficialApiAdapter({
    baseUrl: 'https://backend.example.com',
    fetch: async () => Response.json({ error: 'Você atingiu o limite de perguntas de hoje' }, { status: 429 }),
  })

  await assert.rejects(
    adapter.chat({ message: 'Pergunta', contextItems: [] }, 'access-token'),
    (error: unknown) => error instanceof OfficialApiError
      && error.code === 'AI_DAILY_LIMIT_REACHED'
      && error.status === 429,
  )
})

test('rejeita respostas fora do contrato do BFF', async () => {
  const adapter = new OfficialApiAdapter({
    baseUrl: 'https://backend.example.com',
    fetch: async () => Response.json({ answer: 'Sem identificador de conversa' }),
  })

  await assert.rejects(
    adapter.chat({ message: 'Pergunta', contextItems: [] }, 'access-token'),
    (error: unknown) => error instanceof OfficialApiError && error.code === 'AI_RESPONSE_CONTRACT_INVALID',
  )
})
