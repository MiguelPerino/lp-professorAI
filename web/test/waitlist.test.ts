import assert from 'node:assert/strict'
import test from 'node:test'
import { validateWaitlistInput } from '../src/lib/services.ts'

test('exige nome, e-mail válido e consentimento na lista de novidades', () => {
  assert.match(validateWaitlistInput({ name: '', email: 'pessoa@exemplo.com', whatsapp: '', marketingConsent: true }) ?? '', /nome/)
  assert.match(validateWaitlistInput({ name: 'Pessoa', email: 'inválido', whatsapp: '', marketingConsent: true }) ?? '', /e-mail/)
  assert.match(validateWaitlistInput({ name: 'Pessoa', email: 'pessoa@exemplo.com', whatsapp: '', marketingConsent: false }) ?? '', /consentimento/)
  assert.equal(validateWaitlistInput({ name: 'Pessoa', email: 'pessoa@exemplo.com', whatsapp: '', marketingConsent: true }), null)
})
