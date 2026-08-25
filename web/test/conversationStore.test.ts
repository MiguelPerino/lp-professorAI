import assert from 'node:assert/strict'
import test from 'node:test'
import { appendConversation, clearConversation, loadConversation } from '../src/lib/conversationStore.ts'

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

test('isola e limita o histórico local por usuário Supabase', () => {
  const storage = new MemoryStorage()
  for (let index = 0; index < 22; index += 1) {
    appendConversation('user-a', `Pergunta ${index}`, `Resposta ${index}`, storage)
  }
  appendConversation('user-b', 'Outra pergunta', 'Outra resposta', storage)

  assert.equal(loadConversation('user-a', storage).length, 20)
  assert.equal(loadConversation('user-a', storage)[0].question, 'Pergunta 2')
  assert.equal(loadConversation('user-b', storage).length, 1)

  clearConversation('user-a', storage)
  assert.deepEqual(loadConversation('user-a', storage), [])
  assert.equal(loadConversation('user-b', storage).length, 1)
})
