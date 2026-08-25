import assert from 'node:assert/strict'
import test from 'node:test'
import { OfficialApiAdapter, OfficialApiError } from '../src/lib/officialApi.ts'

const okChat = {
  message: 'Resposta educacional.',
  provider: 'provider',
  model: 'model',
  usage: { inputTokens: 10, cachedInputTokens: 4, outputTokens: 8, estimatedCostUsd: 0.001 },
  disclaimerApplied: true,
}

test('envia cookie, obtém CSRF e usa o cabeçalho na mutação', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = []
  const adapter = new OfficialApiAdapter({
    baseUrl: 'https://api.acoesja.com.br/api',
    fetch: async (input, init) => {
      calls.push({ url: String(input), init })
      if (String(input).endsWith('/auth/csrf')) return Response.json({ headerName: 'x-csrf-token', token: 'csrf' })
      return Response.json(okChat)
    },
  })

  const response = await adapter.chat({ message: 'Pergunta', contextItems: [] })

  assert.equal(response.usage.cachedInputTokens, 4)
  assert.equal(calls.length, 2)
  assert.ok(calls.every((call) => call.init?.credentials === 'include'))
  assert.equal(new Headers(calls[1].init?.headers).get('x-csrf-token'), 'csrf')
  assert.deepEqual(JSON.parse(String(calls[1].init?.body)), { message: 'Pergunta', contextItems: [] })
})

test('serializa refresh concorrente e repete cada chamada no máximo uma vez', async () => {
  let chatCalls = 0
  let refreshCalls = 0
  let releaseRefresh!: () => void
  const refreshGate = new Promise<void>((resolve) => { releaseRefresh = resolve })
  const adapter = new OfficialApiAdapter({
    baseUrl: 'https://api.acoesja.com.br/api',
    refreshPath: '/auth/refresh',
    fetch: async (input) => {
      const url = String(input)
      if (url.endsWith('/auth/csrf')) return Response.json({ headerName: 'x-csrf-token', token: 'csrf' })
      if (url.endsWith('/auth/refresh')) {
        refreshCalls += 1
        await refreshGate
        return Response.json({ ok: true })
      }
      chatCalls += 1
      return chatCalls <= 2 ? Response.json({ code: 'UNAUTHORIZED' }, { status: 401 }) : Response.json(okChat)
    },
  })

  const first = adapter.chat({ message: 'A', contextItems: [] })
  const second = adapter.chat({ message: 'B', contextItems: [] })
  await new Promise((resolve) => setTimeout(resolve, 0))
  releaseRefresh()
  await Promise.all([first, second])

  assert.equal(refreshCalls, 1)
  assert.equal(chatCalls, 4)
})

test('falha fechado após um único refresh e um único retry', async () => {
  let chatCalls = 0
  let refreshCalls = 0
  const adapter = new OfficialApiAdapter({
    baseUrl: 'https://api.acoesja.com.br/api',
    refreshPath: '/auth/refresh',
    fetch: async (input) => {
      const url = String(input)
      if (url.endsWith('/auth/csrf')) return Response.json({ headerName: 'x-csrf-token', token: 'csrf' })
      if (url.endsWith('/auth/refresh')) { refreshCalls += 1; return Response.json({ ok: true }) }
      chatCalls += 1
      return Response.json({ code: 'UNAUTHORIZED' }, { status: 401 })
    },
  })

  await assert.rejects(adapter.chat({ message: 'A', contextItems: [] }), OfficialApiError)
  assert.equal(refreshCalls, 1)
  assert.equal(chatCalls, 2)
})

test('não inventa refresh quando a rota oficial não foi configurada', async () => {
  let refreshCalls = 0
  const adapter = new OfficialApiAdapter({
    baseUrl: 'https://api.acoesja.com.br/api',
    fetch: async (input) => {
      if (String(input).endsWith('/auth/csrf')) return Response.json({ headerName: 'x-csrf-token', token: 'csrf' })
      refreshCalls += 1
      return Response.json({}, { status: 401 })
    },
  })
  await assert.rejects(
    adapter.chat({ message: 'A', contextItems: [] }),
    (error: unknown) => error instanceof OfficialApiError && error.code === 'LOGIN_REQUIRED',
  )
  assert.equal(refreshCalls, 1)
})

test('falha fechado se cachedInputTokens ou outro campo obrigatório não vier', async () => {
  const adapter = new OfficialApiAdapter({
    baseUrl: 'https://api.acoesja.com.br/api',
    fetch: async (input) => String(input).endsWith('/auth/csrf')
      ? Response.json({ headerName: 'x-csrf-token', token: 'csrf' })
      : Response.json({ ...okChat, usage: { inputTokens: 1, outputTokens: 1, estimatedCostUsd: 0 } }),
  })
  await assert.rejects(
    adapter.chat({ message: 'A', contextItems: [] }),
    (error: unknown) => error instanceof OfficialApiError && error.code === 'AI_RESPONSE_CONTRACT_INVALID',
  )
})
