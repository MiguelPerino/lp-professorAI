import assert from 'node:assert/strict'
import test from 'node:test'
import { ProfessorApi, ProfessorApiError } from '../src/lib/professorApi.ts'

test('envia a pergunta diretamente ao backend AçõesJA com bearer Supabase', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = []
  const adapter = new ProfessorApi({
    baseUrl: 'https://api.example.com/api/lp/professor',
    fetch: async (input, init) => {
      calls.push({ url: String(input), init })
      return Response.json({
        message: 'Resposta educacional.',
        provider: 'openai',
        model: 'modelo',
        usage: { inputTokens: 20, cachedInputTokens: 0, outputTokens: 8, estimatedCostUsd: 0.00001 },
        disclaimerApplied: true,
      })
    },
  })

  const response = await adapter.chat({ message: 'Pergunta', conversationId: 'local-id' }, 'access-token')

  assert.equal(response.message, 'Resposta educacional.')
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'https://api.example.com/api/lp/professor/chat')
  assert.equal(new Headers(calls[0].init?.headers).get('authorization'), 'Bearer access-token')
  assert.equal(calls[0].init?.credentials, 'omit')
  assert.deepEqual(JSON.parse(String(calls[0].init?.body)), {
    message: 'Pergunta',
    conversationId: 'local-id',
  })
})

test('consulta o limite diário medido pelo backend', async () => {
  const adapter = new ProfessorApi({
    baseUrl: 'https://api.example.com/api/lp/professor',
    fetch: async () => Response.json({
      cycleStart: '2026-08-01', cycleEnd: '2026-09-01', requestCount: 2,
      providerCallCount: 2, cacheHitCount: 0, inputTokens: 80, cachedInputTokens: 0,
      outputTokens: 30, estimatedCostUsd: 0.00003, unpricedRequestCount: 0,
      unknownUsageRequestCount: 0, dailyCallLimit: 5, callsToday: 2,
    }),
  })

  const usage = await adapter.currentUsage('access-token')
  assert.equal(usage.callsToday, 2)
  assert.equal(usage.dailyCallLimit, 5)
})

test('exige sessão antes de chamar o backend', async () => {
  let called = false
  const adapter = new ProfessorApi({
    baseUrl: 'https://api.example.com/api/lp/professor',
    fetch: async () => { called = true; return Response.json({}) },
  })

  await assert.rejects(
    adapter.chat({ message: 'Pergunta' }, ''),
    (error: unknown) => error instanceof ProfessorApiError && error.code === 'LOGIN_REQUIRED',
  )
  assert.equal(called, false)
})

test('preserva código estável e Retry-After do backend', async () => {
  const adapter = new ProfessorApi({
    baseUrl: 'https://api.example.com/api/lp/professor',
    fetch: async () => Response.json(
      { error: 'AI_DAILY_LIMIT_REACHED', message: 'Limite atingido.' },
      { status: 429, headers: { 'retry-after': '120' } },
    ),
  })

  await assert.rejects(
    adapter.chat({ message: 'Pergunta' }, 'access-token'),
    (error: unknown) => error instanceof ProfessorApiError
      && error.code === 'AI_DAILY_LIMIT_REACHED'
      && error.retryAfterSeconds === 120,
  )
})

test('rejeita respostas fora do contrato real', async () => {
  const adapter = new ProfessorApi({
    baseUrl: 'https://api.example.com/api/lp/professor',
    fetch: async () => Response.json({ answer: 'Contrato antigo do BFF' }),
  })

  await assert.rejects(
    adapter.chat({ message: 'Pergunta' }, 'access-token'),
    (error: unknown) => error instanceof ProfessorApiError && error.code === 'AI_RESPONSE_CONTRACT_INVALID',
  )
})
