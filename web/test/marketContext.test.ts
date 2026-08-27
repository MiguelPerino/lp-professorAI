import assert from 'node:assert/strict'
import test from 'node:test'
import { buildProfessorMessage } from '../src/lib/marketContext.ts'

test('monta contexto do ativo com cotação atual e histórico oficial', async () => {
  const originalFetch = globalThis.fetch
  const urls: string[] = []
  globalThis.fetch = async (input) => {
    const url = String(input)
    urls.push(url)
    if (url.endsWith('/stocks/PETR4')) {
      return Response.json({
        companyName: 'Petrobras', sector: 'Petróleo', referenceYear: 2025,
        netMargin: 12.4, roe: 18.1,
        marketData: { price: 31.5, changePercent: -1.2, pl: 5.8, pvp: 1.1, lastUpdate: '2026-08-26T12:00:00Z' },
      })
    }
    return Response.json([
      { referenceDate: '2025-01-02', closePrice: 30 },
      { referenceDate: '2026-08-25', closePrice: 31.5 },
    ])
  }

  try {
    const message = await buildProfessorMessage('PETR4', 'O que mudou?')
    assert.equal(urls.length, 2)
    assert.match(message, /Ativo selecionado: PETR4/)
    assert.match(message, /"priceBrl":31.5/)
    assert.match(message, /historicalCloseCheckpoints/)
    assert.match(message, /Não recomende compra ou venda/)
  } finally {
    globalThis.fetch = originalFetch
  }
})
