import assert from 'node:assert/strict'
import test from 'node:test'
import { OfficialApiError } from '../src/lib/officialApi.ts'
import { professorErrorState } from '../src/lib/professorState.ts'

const cases = [
  [new OfficialApiError('', 401), 'login'],
  [new OfficialApiError('', 403, 'POLICIES_NOT_ACCEPTED'), 'policies'],
  [new OfficialApiError('', 400, 'AI_CONTEXT_TOO_LARGE'), 'context-too-large'],
  [new OfficialApiError('', 429, 'AI_RATE_LIMITED'), 'limited'],
  [new OfficialApiError('', 429, 'AI_DAILY_LIMIT_REACHED'), 'limited'],
  [new OfficialApiError('', 503, 'AI_PROVIDER_UNAVAILABLE'), 'provider-unavailable'],
  [new OfficialApiError('Falha validada', 400, 'AI_INVALID_REQUEST'), 'error'],
] as const

for (const [error, expected] of cases) {
  test(`mapeia ${error.code ?? error.status} para o estado ${expected}`, () => {
    assert.equal(professorErrorState(error).kind, expected)
  })
}

test('normaliza falhas desconhecidas sem expor detalhes', () => {
  assert.deepEqual(professorErrorState(new Error('segredo')), {
    kind: 'error',
    message: 'Não foi possível concluir sua pergunta. Tente novamente.',
  })
})
