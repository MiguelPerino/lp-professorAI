import { config } from './config'
import type { DemoTicker } from './professorDemo'

type StockAnalysis = {
  companyName?: unknown
  sector?: unknown
  referenceYear?: unknown
  netMargin?: unknown
  roe?: unknown
  marketData?: {
    price?: unknown
    changePercent?: unknown
    pl?: unknown
    pvp?: unknown
    fundamentalsReferenceDate?: unknown
    lastUpdate?: unknown
  }
}

type HistoricalQuote = { referenceDate?: unknown; closePrice?: unknown }

function finite(value: unknown): number | null {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? number : null
}

function text(value: unknown, max = 120): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null
}

async function json<T>(url: string, signal: AbortSignal): Promise<T | null> {
  try {
    const response = await fetch(url, { headers: { accept: 'application/json' }, signal })
    return response.ok ? await response.json() as T : null
  } catch {
    return null
  }
}

function apiRoot(): string {
  const marker = '/lp/professor'
  const index = config.professorApiBase.lastIndexOf(marker)
  return index >= 0 ? config.professorApiBase.slice(0, index) : 'https://api.acoesja.com.br/api'
}

export async function buildProfessorMessage(ticker: DemoTicker, question: string): Promise<string> {
  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), 5_000)
  const root = apiRoot()
  try {
    const [analysis, history] = await Promise.all([
      json<StockAnalysis>(`${root}/stocks/${ticker}`, controller.signal),
      json<HistoricalQuote[]>(`${root}/assets/${ticker}/historical-prices`, controller.signal),
    ])
    const market = analysis?.marketData
    const validHistory = Array.isArray(history)
      ? history.map((quote) => ({ date: text(quote.referenceDate, 10), close: finite(quote.closePrice) }))
        .filter((quote): quote is { date: string; close: number } => Boolean(quote.date) && quote.close !== null)
        .sort((left, right) => left.date.localeCompare(right.date))
      : []
    const checkpoints = validHistory.length > 1
      ? [validHistory[0], validHistory[Math.floor((validHistory.length - 1) / 2)], validHistory.at(-1)]
      : validHistory
    const context = {
      ticker,
      company: text(analysis?.companyName),
      sector: text(analysis?.sector),
      accountingReferenceYear: finite(analysis?.referenceYear),
      netMarginPercent: finite(analysis?.netMargin),
      roePercent: finite(analysis?.roe),
      currentQuote: {
        priceBrl: finite(market?.price),
        changePercent: finite(market?.changePercent),
        pe: finite(market?.pl),
        priceToBook: finite(market?.pvp),
        fundamentalsReferenceDate: text(market?.fundamentalsReferenceDate, 10),
        lastUpdate: text(market?.lastUpdate, 40),
      },
      historicalCloseCheckpoints: checkpoints,
      contextSource: 'APIs públicas do AçõesJA',
    }
    return `Ativo selecionado: ${ticker}.\nPergunta do usuário: ${question}\nContexto estruturado disponível: ${JSON.stringify(context)}\nResponda em português do Brasil, conectando explicitamente a explicação ao ativo e sinalizando dados ausentes ou defasados. Não recomende compra ou venda.`
  } finally {
    globalThis.clearTimeout(timeout)
  }
}
