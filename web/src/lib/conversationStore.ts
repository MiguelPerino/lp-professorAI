export type LocalConversationEntry = {
  id: string
  ticker?: string
  question: string
  answer: string
  createdAt: string
}

const PREFIX = 'acoesja:professor-history:v1:'
const MAX_ENTRIES = 20
const MAX_QUESTION_CHARS = 2_000
const MAX_ANSWER_CHARS = 12_000

function key(userId: string): string {
  return `${PREFIX}${userId}`
}

function validEntry(value: unknown): value is LocalConversationEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Record<string, unknown>
  return typeof entry.id === 'string'
    && typeof entry.question === 'string'
    && entry.question.length <= MAX_QUESTION_CHARS
    && typeof entry.answer === 'string'
    && entry.answer.length <= MAX_ANSWER_CHARS
    && (entry.ticker === undefined || typeof entry.ticker === 'string')
    && typeof entry.createdAt === 'string'
}

export function loadConversation(userId: string, storage: Storage = window.localStorage): LocalConversationEntry[] {
  if (!userId) return []
  try {
    const parsed = JSON.parse(storage.getItem(key(userId)) ?? '[]') as unknown
    return Array.isArray(parsed) ? parsed.filter(validEntry).slice(-MAX_ENTRIES) : []
  } catch {
    return []
  }
}

export function appendConversation(
  userId: string,
  question: string,
  answer: string,
  ticker?: string,
  storage: Storage = window.localStorage,
): LocalConversationEntry[] {
  const entry: LocalConversationEntry = {
    id: crypto.randomUUID(),
    ticker,
    question: question.slice(0, MAX_QUESTION_CHARS),
    answer: answer.slice(0, MAX_ANSWER_CHARS),
    createdAt: new Date().toISOString(),
  }
  const history = [...loadConversation(userId, storage), entry].slice(-MAX_ENTRIES)
  storage.setItem(key(userId), JSON.stringify(history))
  return history
}

export function clearConversation(userId: string, storage: Storage = window.localStorage): void {
  if (userId) storage.removeItem(key(userId))
}
