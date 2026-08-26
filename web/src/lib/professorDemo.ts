import { config, isSupabaseConfigured } from './config'

export const demoAssets = [
  { ticker: 'PETR4', name: 'Petrobras PN' },
  { ticker: 'ITUB4', name: 'Itaú Unibanco PN' },
] as const

export type DemoTicker = typeof demoAssets[number]['ticker']
export type StandardQuestionKey = 'profit_but_stock_fell' | 'high_pe_expensive'

export const standardQuestions: ReadonlyArray<{
  key: StandardQuestionKey
  text: string
}> = [
  { key: 'profit_but_stock_fell', text: 'A empresa teve lucro. Então por que a ação caiu?' },
  { key: 'high_pe_expensive', text: 'P/L alto significa que uma ação está cara?' },
]

export type StandardAnswer = {
  ticker: DemoTicker
  assetName: string
  questionKey: StandardQuestionKey
  questionText: string
  answerMarkdown: string
  investigationHint: string
  sourceLabel: string
}

type RpcAnswer = {
  ticker?: unknown
  asset_name?: unknown
  question_key?: unknown
  question_text?: unknown
  answer_markdown?: unknown
  investigation_hint?: unknown
  source_label?: unknown
}

const fallbackAnswers: Record<DemoTicker, Record<StandardQuestionKey, Omit<StandardAnswer, 'ticker' | 'questionKey'>>> = {
  PETR4: {
    profit_but_stock_fell: {
      assetName: 'Petrobras PN',
      questionText: standardQuestions[0].text,
      answerMarkdown: 'Em **PETR4**, lucro e preço da ação podem andar em direções diferentes porque o mercado compara o resultado com o que já esperava e tenta antecipar os próximos trimestres. Mesmo com lucro, a cotação pode cair se o resultado vier abaixo das expectativas, se petróleo e câmbio piorarem, se aumentarem investimentos ou se houver incerteza sobre preços de combustíveis, governança e dividendos.\n\nA pergunta mais útil não é apenas “houve lucro?”, mas **de onde ele veio, se foi recorrente e o que mudou nas expectativas futuras**. Esta é uma explicação educacional, não uma recomendação.',
      investigationHint: 'Compare o lucro com o consenso, a geração de caixa, a dívida, o plano de investimentos, o Brent, o câmbio e a política de dividendos; depois observe a reação da cotação ao redor da divulgação.',
      sourceLabel: 'Conteúdo educacional AçõesJA',
    },
    high_pe_expensive: {
      assetName: 'Petrobras PN',
      questionText: standardQuestions[1].text,
      answerMarkdown: 'Um **P/L alto não prova sozinho que PETR4 está cara**. Em uma empresa cíclica, o lucro do denominador pode estar temporariamente deprimido, elevando o múltiplo sem que o preço tenha subido. O inverso também ocorre: um P/L baixo pode refletir lucro perto do pico do ciclo ou riscos que o mercado já descontou.\n\nPara PETR4, leia o P/L junto com o ciclo do petróleo, câmbio, custos, investimentos, dívida, governança e sustentabilidade dos dividendos. **Múltiplos ganham sentido quando comparados no tempo e com empresas semelhantes.**',
      investigationHint: 'Compare o P/L atual com o histórico da própria Petrobras e pares do setor, normalizando lucros extraordinários; confira também fluxo de caixa livre, EV/EBITDA e cenários para o Brent.',
      sourceLabel: 'Conteúdo educacional AçõesJA',
    },
  },
  ITUB4: {
    profit_but_stock_fell: {
      assetName: 'Itaú Unibanco PN',
      questionText: standardQuestions[0].text,
      answerMarkdown: 'Em **ITUB4**, apresentar lucro não garante alta da ação. O mercado avalia se o resultado superou as expectativas e se a qualidade do lucro parece sustentável. A cotação pode cair diante de piora esperada na inadimplência, aumento do custo de crédito, pressão na margem financeira, despesas maiores ou uma projeção futura mais fraca, mesmo que o lucro atual seja positivo.\n\nTambém importa separar efeitos recorrentes de itens extraordinários. **O preço reage à diferença entre resultado, expectativa e perspectiva**, não somente ao sinal positivo do lucro.',
      investigationHint: 'Compare lucro recorrente e consenso, ROE, margem financeira, inadimplência, cobertura, custo de crédito e guidance; observe também se a reação ocorreu antes da divulgação.',
      sourceLabel: 'Conteúdo educacional AçõesJA',
    },
    high_pe_expensive: {
      assetName: 'Itaú Unibanco PN',
      questionText: standardQuestions[1].text,
      answerMarkdown: 'Um **P/L alto não basta para concluir que ITUB4 está cara**. Ele pode refletir expectativa de lucros mais previsíveis, boa rentabilidade, crescimento ou menor risco percebido. Também pode subir porque o lucro do período caiu temporariamente, sem que a cotação tenha avançado.\n\nEm bancos, combine o P/L com **P/VP e ROE**: pagar mais sobre o patrimônio pode fazer sentido quando a instituição gera retorno superior e sustentável, mas essa hipótese precisa resistir a cenários de inadimplência, custo de crédito e pressão nas margens.',
      investigationHint: 'Compare P/L, P/VP e ROE de ITUB4 com seu próprio histórico e bancos semelhantes; verifique crescimento do lucro recorrente, qualidade da carteira de crédito e custo de risco.',
      sourceLabel: 'Conteúdo educacional AçõesJA',
    },
  },
}

function rpcHeaders(): HeadersInit {
  return {
    apikey: config.supabaseAnonKey,
    authorization: `Bearer ${config.supabaseAnonKey}`,
    'content-type': 'application/json',
  }
}

function parseAnswer(row: RpcAnswer | undefined): StandardAnswer | null {
  if (!row || !demoAssets.some((asset) => asset.ticker === row.ticker)
    || !standardQuestions.some((question) => question.key === row.question_key)
    || typeof row.asset_name !== 'string' || typeof row.question_text !== 'string'
    || typeof row.answer_markdown !== 'string' || typeof row.investigation_hint !== 'string'
    || typeof row.source_label !== 'string') return null
  return {
    ticker: row.ticker as DemoTicker,
    assetName: row.asset_name,
    questionKey: row.question_key as StandardQuestionKey,
    questionText: row.question_text,
    answerMarkdown: row.answer_markdown,
    investigationHint: row.investigation_hint,
    sourceLabel: row.source_label,
  }
}

export function standardQuestionKey(question: string): StandardQuestionKey | null {
  return standardQuestions.find((candidate) => candidate.text === question.trim())?.key ?? null
}

export function standardAnswerPreview(ticker: DemoTicker, questionKey: StandardQuestionKey): StandardAnswer {
  return { ticker, questionKey, ...fallbackAnswers[ticker][questionKey] }
}

export async function getStandardAnswer(ticker: DemoTicker, questionKey: StandardQuestionKey): Promise<StandardAnswer> {
  if (isSupabaseConfigured) {
    try {
      const response = await fetch(`${config.supabaseUrl}/rest/v1/rpc/get_professor_standard_answer`, {
        method: 'POST',
        headers: rpcHeaders(),
        body: JSON.stringify({ p_ticker: ticker, p_question_key: questionKey }),
      })
      if (response.ok) {
        const payload = await response.json() as RpcAnswer[]
        const answer = parseAnswer(payload[0])
        if (answer) return answer
      }
    } catch {
      // O fallback versionado mantém a demonstração funcional durante rollout do schema.
    }
  }
  return standardAnswerPreview(ticker, questionKey)
}

const SESSION_KEY = 'acoesja:lp-session-id:v1'

function sessionId(): string {
  const current = window.localStorage.getItem(SESSION_KEY)
  if (current && /^[0-9a-f-]{36}$/i.test(current)) return current
  const created = crypto.randomUUID()
  window.localStorage.setItem(SESSION_KEY, created)
  return created
}

export async function recordLpInteraction(
  eventName: string,
  context: { ticker?: DemoTicker; questionKey?: StandardQuestionKey; properties?: Record<string, string | number | boolean> } = {},
): Promise<void> {
  if (!isSupabaseConfigured || !/^[a-z][a-z0-9_]{2,63}$/.test(eventName)) return
  try {
    await fetch(`${config.supabaseUrl}/rest/v1/rpc/record_lp_interaction`, {
      method: 'POST',
      headers: rpcHeaders(),
      keepalive: true,
      body: JSON.stringify({
        p_session_id: sessionId(),
        p_event_name: eventName,
        p_ticker: context.ticker ?? null,
        p_question_key: context.questionKey ?? null,
        p_properties: context.properties ?? {},
      }),
    })
  } catch {
    // Analytics nunca bloqueia a experiência principal.
  }
}
