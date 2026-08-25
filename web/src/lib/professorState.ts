import { OfficialApiError } from './officialApi'

export type ProfessorState =
  | { kind: 'idle' }
  | { kind: 'checking-session' }
  | { kind: 'login'; message: string }
  | { kind: 'policies'; message: string }
  | { kind: 'context-too-large'; message: string }
  | { kind: 'limited'; message: string }
  | { kind: 'provider-unavailable'; message: string }
  | { kind: 'error'; message: string }
  | { kind: 'asking' }
  | { kind: 'answered' }
  | { kind: 'preview-only'; message: string }

export function professorErrorState(reason: unknown): ProfessorState {
  if (!(reason instanceof OfficialApiError)) {
    return { kind: 'error', message: 'Não foi possível concluir sua pergunta. Tente novamente.' }
  }
  if (reason.status === 401 || reason.code === 'LOGIN_REQUIRED') {
    return { kind: 'login', message: 'Entre com seu e-mail para enviar esta pergunta ao Professor.' }
  }
  if (reason.code === 'POLICIES_NOT_ACCEPTED') {
    return { kind: 'policies', message: 'Aceite as políticas oficiais do AçõesJá antes de continuar.' }
  }
  if (reason.code === 'AI_CONTEXT_TOO_LARGE') {
    return { kind: 'context-too-large', message: 'O contexto selecionado é grande demais. Remova itens e tente novamente.' }
  }
  if (reason.code === 'AI_RATE_LIMITED' || reason.code === 'AI_DAILY_LIMIT_REACHED' || reason.status === 429) {
    return { kind: 'limited', message: 'O limite informado pelo servidor foi atingido. Aguarde antes de tentar novamente.' }
  }
  if (reason.code === 'AI_PROVIDER_UNAVAILABLE') {
    return { kind: 'provider-unavailable', message: 'O provedor está indisponível agora. Nenhuma resposta simulada foi usada.' }
  }
  return { kind: 'error', message: reason.message }
}
