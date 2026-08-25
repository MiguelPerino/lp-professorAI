import assert from 'node:assert/strict'
import test from 'node:test'
import { ProfessorApiError } from '../src/lib/professorApi.ts'
import { professorErrorState } from '../src/lib/professorState.ts'

const cases = [
  [new ProfessorApiError('', 401), 'login'],
  [new ProfessorApiError('', 400, 'AI_CONTEXT_TOO_LARGE'), 'context-too-large'],
  [new ProfessorApiError('', 429, 'AI_RATE_LIMITED'), 'limited'],
  [new ProfessorApiError('', 429, 'AI_DAILY_LIMIT_REACHED'), 'limited'],
  [new ProfessorApiError('', 503, 'AI_PROVIDER_UNAVAILABLE'), 'provider-unavailable'],
  [new ProfessorApiError('Falha validada', 400, 'AI_INVALID_REQUEST'), 'error'],
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
