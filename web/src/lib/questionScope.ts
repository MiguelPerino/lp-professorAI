import type { DemoTicker } from './professorDemo'

export type QuestionScope = 'financial' | 'social' | 'off-topic' | 'ambiguous'

const financialSignals = [
  'acao', 'ativo', 'empresa', 'lucro', 'receita liquida', 'divida', 'caixa', 'margem',
  'roe', 'roic', 'ebitda', 'balanco', 'resultado', 'cotacao', 'preco', 'mercado',
  'investimento', 'investir', 'dividendo', 'pl', 'pvp', 'valuation', 'caro', 'cara',
  'barato', 'barata', 'caiu', 'queda', 'subiu', 'alta', 'risco', 'petrobras', 'itau',
  'petr4', 'itub4', 'selic', 'juros', 'inflacao', 'cambio', 'dolar', 'petroleo',
  'inadimplencia', 'credito', 'governanca', 'guidance', 'trimestre', 'setor',
]

const offTopicSignals = [
  'capital da franca', 'capital do brasil', 'receita de bolo', 'receita culinaria',
  'previsao do tempo', 'vai chover', 'resultado do jogo', 'quem ganhou o jogo',
  'futebol', 'novela', 'horoscopo', 'signo', 'poema', 'letra de musica', 'traduz este',
  'traduza este', 'codigo em python', 'codigo javascript', 'programacao', 'debugue',
  'ignore as instrucoes', 'ignore instrucoes', 'prompt do sistema', 'system prompt',
  'finja que voce', 'agora voce e',
]

const socialPatterns = [
  /^(oi|ola|e ai|bom dia|boa tarde|boa noite)[!.?\s]*$/,
  /^(quem e voce|o que voce faz|como voce pode me ajudar)[?.!\s]*$/,
]

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export function classifyQuestionScope(question: string): QuestionScope {
  const normalized = normalize(question)
  if (socialPatterns.some((pattern) => pattern.test(normalized))) return 'social'
  if (offTopicSignals.some((signal) => normalized.includes(signal))) return 'off-topic'
  if (financialSignals.some((signal) => normalized.includes(signal))) return 'financial'
  return 'ambiguous'
}

export function guidedProfessorResponse(ticker: DemoTicker, question: string): {
  scope: 'social' | 'off-topic'
  answer: string
  hint: string
} | null {
  const scope = classifyQuestionScope(question)
  if (scope === 'social') {
    return {
      scope,
      answer: `Olá! Eu sou o **Professor IA do AçõesJA**. Meu papel é ajudar você a interpretar empresas, indicadores e movimentos de mercado com contexto — não responder como uma IA genérica.\n\nVocê selecionou **${ticker}**. Podemos começar entendendo por que a cotação pode cair mesmo quando a empresa apresenta lucro, ou como interpretar o P/L desse ativo.`,
      hint: `Escolha uma das perguntas sugeridas para analisar ${ticker}, ou escreva uma dúvida sobre resultado, preço, risco, dívida ou indicadores.`,
    }
  }
  if (scope === 'off-topic') {
    return {
      scope,
      answer: `Esse assunto foge do meu foco. Eu sou o **Professor IA do AçõesJA** e concentro minhas explicações em investimentos, empresas e mercado de capitais.\n\nComo você selecionou **${ticker}**, posso aproveitar a conversa para mostrar, por exemplo, por que uma ação pode cair mesmo quando a empresa teve lucro ou o que um P/L alto realmente diz sobre esse ativo.`,
      hint: `Dica: transforme sua curiosidade em uma pergunta sobre ${ticker}. Experimente “A empresa teve lucro. Então por que a ação caiu?” ou “P/L alto significa que uma ação está cara?”.`,
    }
  }
  return null
}
