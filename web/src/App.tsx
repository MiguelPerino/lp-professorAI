import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  LockKeyhole,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import brandLogo from '../../design/Logo preta.jpeg'
import brandIcon from '../../design/Logo Ícone preto.png'
import { track } from './lib/analytics'
import { isSupabaseConfigured } from './lib/config'
import { askProfessor, joinWaitlist, requestMagicLink, startGoogleLogin } from './lib/services'
import { getSupabaseClient } from './lib/supabase'

type ModalKind = 'auth' | 'checkout' | 'terms' | 'privacy' | null

const questions = [
  'A empresa teve lucro. Então por que a ação caiu?',
  'P/L alto significa que uma ação está cara?',
  'Como eu sei se a dívida dessa empresa é preocupante?',
  'O resultado foi bom. O que eu deveria analisar agora?',
]

const responses: Record<string, string> = {
  [questions[0]]:
    'Porque o mercado olha para o futuro, não só para o resultado atual. Se o lucro veio abaixo do esperado, houve pressão de custos ou as projeções pioraram, a ação pode cair mesmo depois de um bom número no presente.',
  [questions[1]]:
    'Não necessariamente. Um P/L alto mostra que o mercado paga mais por cada real de lucro. Isso pode refletir crescimento esperado — e pede que você investigue se esse crescimento parece sustentável.',
  [questions[2]]:
    'Comece comparando a dívida líquida com a geração de caixa e o EBITDA. Depois, olhe prazos, juros e a capacidade de pagamento: o contexto importa mais que um número isolado.',
  [questions[3]]:
    'Compare o resultado com as expectativas, os períodos anteriores e empresas do mesmo setor. Depois, investigue se o crescimento veio de uma operação mais forte ou de um evento pontual.',
}

const flowSteps = [
  {
    title: 'Escolha a ação',
    summary: 'Você seleciona a empresa que quer entender.',
    explanationTitle: 'A análise começa em uma ação específica.',
    explanation: 'Escolha a ação que você quer analisar. A partir daí, o Professor sabe qual empresa, setor e momento do mercado devem orientar a conversa.',
  },
  {
    title: 'Dados atuais',
    summary: 'Métricas e acontecimentos entram no contexto.',
    explanationTitle: 'Os números da ação dão base à resposta.',
    explanation: 'P/L, ROE, dívida, margens, resultados e dados atualizados ajudam o Professor a responder sobre a situação real daquela empresa — não sobre um exemplo genérico.',
  },
  {
    title: 'Sua pergunta',
    summary: 'Pergunte sobre a métrica que chamou atenção.',
    explanationTitle: 'Você pergunta do seu jeito.',
    explanation: 'Você pode perguntar sobre P/L, dívida, resultados ou qualquer dado que chamou sua atenção. Não é necessário dominar termos técnicos; basta contar o que quer compreender.',
  },
  {
    title: 'Explicação',
    summary: 'O Professor conecta a métrica à empresa.',
    explanationTitle: 'A resposta considera o contexto escolhido.',
    explanation: 'O Professor traduz o indicador e explica o que ele pode representar naquele ativo, considerando histórico, setor e momento da empresa.',
  },
  {
    title: 'Próximo passo',
    summary: 'Você descobre o que comparar e investigar.',
    explanationTitle: 'A explicação vira um caminho de análise.',
    explanation: 'Além de responder, o Professor mostra quais métricas, períodos e empresas podem ser comparados para você continuar investigando com clareza.',
  },
]

function Logo() {
  return (
    <a className="brand" href="#inicio" aria-label="AçõesJa, início">
      <img src={brandLogo} alt="AçõesJa" />
    </a>
  )
}

function ProfessorAvatar({ small = false }: { small?: boolean }) {
  return <img className={small ? 'prof-avatar small' : 'prof-avatar'} src={brandIcon} alt="" />
}

function Modal({ kind, onClose }: { kind: Exclude<ModalKind, null>; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const details = useMemo(() => {
    if (kind === 'terms') return { eyebrow: 'AçõesJa', title: 'Termos de Uso', text: 'O texto oficial dos Termos de Uso será inserido aqui antes da publicação. Neste protótipo, este modal valida apenas a experiência de leitura sem abrir uma nova página.' }
    if (kind === 'privacy') return { eyebrow: 'AçõesJa', title: 'Política de Privacidade', text: 'O texto oficial da Política de Privacidade será inserido aqui antes da publicação. Neste protótipo, nenhum dado enviado é armazenado.' }
    if (kind === 'auth') return { eyebrow: 'Professor IA', title: 'Continue para fazer sua pergunta', text: 'O Professor usa sua identificação para liberar a experiência e aplicar um limite individual de interações.' }
    return { eyebrow: 'Professor IA', title: 'O lançamento ainda não está aberto.', text: 'Entre na lista para receber uma condição especial quando o Professor estiver disponível.' }
  }, [kind])

  const message = (reason: unknown) => reason && typeof reason === 'object' && 'message' in reason
    ? String(reason.message)
    : 'Não foi possível concluir agora. Tente novamente.'

  const submitAuth = async () => {
    if (loading) return
    if (!email.trim()) return setError('Informe seu e-mail para continuar.')
    setLoading(true); setError('')
    try {
      await requestMagicLink(email.trim())
      track('auth_magic_link_requested')
      setSubmitted(true)
    } catch (reason) { setError(message(reason)) } finally { setLoading(false) }
  }

  const submitWaitlist = async () => {
    if (!email.trim()) return setError('Informe seu melhor e-mail.')
    setLoading(true); setError('')
    try {
      await joinWaitlist({ name, email, whatsapp, marketingConsent })
      track('launch_list_joined', { marketing_consent: marketingConsent })
      setSubmitted(true)
    } catch (reason) { setError(message(reason)) } finally { setLoading(false) }
  }

  const googleLogin = () => {
    try {
      track('auth_google_started')
      startGoogleLogin()
    } catch (reason) { setError(message(reason)) }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar modal"><X size={20} /></button>
          <span className="eyebrow">{details.eyebrow}</span>
        <h2 id="modal-title">{details.title}</h2>
        <p>{details.text}</p>
        {kind === 'auth' && !submitted && <>
          <button className="google-button" onClick={googleLogin}><span>G</span> Continuar com Google</button>
          <div className="or"><i />ou<i /></div>
          <label className="field-label" htmlFor="auth-email">Seu e-mail</label>
          <input id="auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" />
          <button className="button button-dark wide" disabled={loading} onClick={submitAuth}>{loading ? 'Enviando...' : 'Continuar com e-mail'} <ArrowRight size={17} /></button>
          <small>Sem senha. Você receberia um link seguro para continuar.</small>
        </>}
        {kind === 'checkout' && !submitted && <>
          <label className="field-label" htmlFor="lead-name">Como podemos chamar você? <span>opcional</span></label>
          <input id="lead-name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" />
          <label className="field-label" htmlFor="lead-email">Seu melhor e-mail</label>
          <input id="lead-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" />
          <label className="field-label optional" htmlFor="lead-whatsapp">WhatsApp <span>opcional</span></label>
          <input id="lead-whatsapp" type="tel" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="(11) 99999-9999" />
          <label className="consent"><input type="checkbox" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} /> <span>Quero receber novidades do lançamento por e-mail.</span></label>
          <button className="button button-dark wide" disabled={loading} onClick={submitWaitlist}>{loading ? 'Enviando...' : 'Quero receber a condição'} <ArrowRight size={17} /></button>
        </>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {submitted && <div className="submitted"><span><Check size={22} /></span><h3>{kind === 'auth' ? 'Verifique seu e-mail.' : 'Você está na lista.'}</h3><p>{kind === 'auth' ? 'Enviamos um link de acesso para seu e-mail. Depois de entrar, você voltará para o Professor IA.' : 'Seu cadastro foi salvo. Avisaremos você quando houver uma condição de lançamento.'}</p><button className="button button-dark wide" onClick={onClose}>Voltar para a página</button></div>}
      </section>
    </div>
  )
}

function App() {
  const [modal, setModal] = useState<ModalKind>(null)
  const [query, setQuery] = useState('')
  const [activeQuestion, setActiveQuestion] = useState(questions[0])
  const [activeFlowStep, setActiveFlowStep] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [liveAnswer, setLiveAnswer] = useState('')
  const [questionError, setQuestionError] = useState('')
  const [asking, setAsking] = useState(false)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true
    const supabase = getSupabaseClient()

    void supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const openProfessor = async () => {
    const currentSession = session ?? (isSupabaseConfigured
      ? (await getSupabaseClient().auth.getSession()).data.session
      : null)

    if (currentSession) {
      document.getElementById('perguntar')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setModal('auth')
  }

  const selectQuestion = (question: string) => {
    setActiveQuestion(question)
    document.getElementById('demonstracao')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const startQuestion = async () => {
    const question = query.trim()
    if (!question) return
    setAsking(true)
    setQuestionError('')
    setLiveAnswer('')
    track('professor_question_started', { question_length: question.length })
    try {
      const response = await askProfessor(question)
      setLiveAnswer(response.answer)
      track('professor_question_answered', { conversation_id: response.conversationId })
    } catch (reason) {
      const message = reason && typeof reason === 'object' && 'message' in reason
        ? String(reason.message)
        : 'Não foi possível enviar sua pergunta.'
      if (message.includes('Faça login')) {
        setModal('auth')
      } else {
        setQuestionError(message)
        track('professor_question_failed', { reason: message })
      }
    } finally {
      setAsking(false)
    }
  }

  return (
    <main id="inicio">
      <div className="notice"><span>Professor IA disponível para teste</span><a href="#perguntar">Faça sua primeira pergunta <ArrowRight size={14} /></a></div>
      <header className="header container">
        <Logo />
        <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Navegação principal">
          <a href="#como-funciona" onClick={() => setMenuOpen(false)}>Como funciona</a>
          <a href="#demonstracao" onClick={() => setMenuOpen(false)}>Ver exemplos</a>
          <button className="nav-cta" onClick={() => { void openProfessor(); setMenuOpen(false) }}>Usar o Professor <ArrowRight size={16} /></button>
        </nav>
        <button className="menu" aria-label="Abrir menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={24} /></button>
      </header>

      <section className="hero container" id="perguntar">
        <div className="hero-copy">
          <div className="product-label"><span className="pulse-dot" /> Entenda o que é e como funciona o Professor IA</div>
          <p className="hero-product">Seu guia educacional dentro do AçõesJa.</p>
          <h1>Escolha uma ação. Entenda o que os <em>números dela</em> querem dizer.</h1>
          <p>O Professor IA usa as métricas e os dados atualizados da ação que você escolheu para explicar P/L, dívida, resultados e outros indicadores dentro do contexto real daquela empresa.</p>
          <div className="hero-benefits" aria-label="Para que serve o Professor IA">
            <div><span>01</span><p><strong>Escolha uma ação</strong> que você quer entender melhor.</p></div>
            <div><span>02</span><p><strong>Pergunte sobre os dados</strong> que chamaram sua atenção.</p></div>
            <div><span>03</span><p><strong>Receba uma explicação</strong> baseada naquele ativo.</p></div>
          </div>
          <div className="hero-actions">
            <a className="button button-primary" href="#demonstracao">Ver demonstração <ArrowDownRight size={18} /></a>
            <a className="text-link" href="#como-funciona">Entenda como o Professor IA funciona <ChevronRight size={16} /></a>
          </div>
          <div className="trust"><ShieldCheck size={18} /><span>Uma experiência educacional. Sem recomendações de compra ou venda.</span></div>
        </div>
        <div className="hero-professor-panel" aria-label="Teste o Professor IA">
          <div className="hero-professor-head">
            <div><ProfessorAvatar /><div><strong>Professor IA</strong><small><i /> pronto para ajudar</small></div></div>
            <span>Teste disponível</span>
          </div>
          <div className="hero-professor-intro">
            <span>ENTENDA COMO FUNCIONA</span>
            <h2>Uma resposta com o contexto da ação.</h2>
            <p>Escolha o ativo, veja suas métricas atualizadas e pergunte o que aquele número representa para a empresa.</p>
          </div>
          <div className="question-box hero-question-box">
            <div className="question-box-head"><span><MessageCircle size={17} /> Pergunte ao Professor</span><small><LockKeyhole size={14} /> {session ? 'sessão ativa' : 'login seguro ao enviar'}</small></div>
            <label className="sr-only" htmlFor="hero-question">Sua pergunta</label>
            <textarea id="hero-question" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: A empresa X teve lucro. Por que a ação dela caiu?" maxLength={280} />
            <div className="question-suggestions" aria-label="Sugestões de perguntas">
              {questions.slice(0, 2).map((question) => <button key={question} type="button" onClick={() => setQuery(question)}>{question}</button>)}
            </div>
            <div className="question-box-bottom"><small>{query.length}/280</small><button className="button button-primary" disabled={asking || !query.trim()} onClick={startQuestion}>{asking ? 'Analisando...' : 'Perguntar agora'} <ArrowRight size={17} /></button></div>
            {questionError && <p className="form-error question-error" role="alert">{questionError}</p>}
            {liveAnswer && <article className="live-answer" aria-live="polite"><span>Professor IA</span><p>{liveAnswer}</p></article>}
          </div>
          <p className="hero-test-note"><Sparkles size={14} /> Seu teste ajuda a validar se o Professor IA deve fazer parte do AçõesJa.</p>
        </div>
      </section>

      <section className="context-section container" id="como-funciona">
        <div><span className="eyebrow">Como o Professor ajuda</span><h2>Da ação escolhida à explicação que faz sentido.</h2></div>
        <p>O Professor parte dos dados da empresa selecionada para explicar a métrica no contexto daquele ativo e indicar o que vale investigar depois.</p>
        <div className="ecosystem-note" aria-label="Professor IA é a experiência de aprendizado do AçõesJa">
          <div><span>O ecossistema</span><strong>AçõesJa</strong></div>
          <ArrowDownRight size={18} />
          <div><span>A experiência de aprendizado</span><strong>Professor IA</strong></div>
        </div>
        <div className="flow" aria-label="Ação escolhida leva a dados atuais, pergunta, explicação e próximo passo">
          {flowSteps.map((step, index) => <button key={step.title} type="button" className={`flow-item${activeFlowStep === index ? ' active' : ''}`} aria-pressed={activeFlowStep === index} onClick={() => setActiveFlowStep(index)}><span>0{index + 1}</span><strong>{step.title}</strong><p>{step.summary}</p>{index < 4 && <ArrowRight className="flow-arrow" size={18} />}</button>)}
        </div>
        <article className="flow-explainer" aria-live="polite">
          <span>Etapa {activeFlowStep + 1} · {flowSteps[activeFlowStep].title}</span>
          <h3>{flowSteps[activeFlowStep].explanationTitle}</h3>
          <p>{flowSteps[activeFlowStep].explanation}</p>
        </article>
      </section>

      <section className="question-strip" aria-labelledby="question-title">
        <div className="container">
          <p id="question-title"><Sparkles size={16} /> Uma ação, seus dados e as perguntas certas</p>
          <div className="question-pills">
            {questions.map((question) => <button key={question} onClick={() => selectQuestion(question)}>{question}<ArrowRight size={15} /></button>)}
          </div>
        </div>
      </section>

      <section className="demo-section" id="demonstracao">
        <div className="container demo-layout">
          <div className="demo-intro"><span className="eyebrow">Professor IA em ação</span><h2>Não é uma resposta pronta. É um caminho para investigar.</h2><p>Veja como uma dúvida sobre uma ação se transforma em contexto, explicação e uma próxima pergunta mais inteligente.</p><div className="demo-stat"><Clock3 size={18} /><span>Em poucos minutos, transforme uma dúvida em um caminho de análise.</span></div></div>
          <article className="demo-chat">
            <div className="demo-chat-head"><div><ProfessorAvatar /><div><strong>Professor IA</strong><small>Uma demonstração simulada</small></div></div><span className="demo-badge">AçõesJa</span></div>
            <div className="conversation">
              <span className="speaker">VOCÊ</span>
              <p className="user-message">{activeQuestion}</p>
              <span className="speaker professor-speaker"><ProfessorAvatar small /> PROFESSOR IA</span>
              <div className="professor-message"><p>{responses[activeQuestion]}</p><div className="investigate"><span>Para investigar melhor</span><strong>Compare esse indicador com empresas do mesmo setor e veja como ele mudou nos últimos anos.</strong></div></div>
            </div>
            <div className="demo-options"><span>Explore outro exemplo:</span>{questions.filter((q) => q !== activeQuestion).slice(0, 2).map((question) => <button key={question} onClick={() => selectQuestion(question)}>{question}</button>)}</div>
          </article>
        </div>
      </section>

      <section className="launch-section">
        <div className="container launch-content"><div><span className="eyebrow light">O próximo passo</span><h2>Quando o Professor estiver disponível, você quer continuar a conversa?</h2></div><button className="button button-light" onClick={() => setModal('checkout')}>Quero receber a condição de lançamento <ArrowRight size={18} /></button></div>
      </section>

      <footer className="footer container"><Logo /><p>Professor IA é a experiência educacional do ecossistema AçõesJa. Não constitui recomendação de investimento.</p><div><button onClick={() => setModal('terms')}>Termos de Uso</button><button onClick={() => setModal('privacy')}>Política de Privacidade</button><span>© 2026 AçõesJa</span></div></footer>
      {modal && <Modal kind={modal} onClose={() => setModal(null)} />}
    </main>
  )
}

export default App
