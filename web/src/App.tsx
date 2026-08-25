import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { isGitHubPagesPreview, isOfficialProfessorEnabled } from './lib/config'
import { professorErrorState } from './lib/professorState'
import type { ProfessorState } from './lib/professorState'
import { askProfessor, hasProfessorSession, initializeProfessorAuth, joinWaitlist, sendProfessorOtp, verifyProfessorOtp } from './lib/services'

type ModalKind = 'checkout' | 'terms' | 'privacy' | null
const PENDING_PROFESSOR_QUESTION_KEY = 'acoesja:pending-professor-question'
const PROFESSOR_OTP_LENGTH = 8

const questions = [
  'A empresa teve lucro. Então por que a ação caiu?',
  'P/L alto significa que uma ação está cara?',
  'Como eu sei se a dívida dessa empresa é preocupante?',
  'Quais argumentos fortalecem ou enfraquecem esta análise?',
]

const responses: Record<string, string> = {
  [questions[0]]:
    'Porque o mercado olha para o futuro, não só para o resultado atual. Se o lucro veio abaixo do esperado, houve pressão de custos ou as projeções pioraram, a ação pode cair mesmo depois de um bom número no presente.',
  [questions[1]]:
    'Não necessariamente. Um P/L alto mostra que o mercado paga mais por cada real de lucro. Isso pode refletir crescimento esperado — e pede que você investigue se esse crescimento parece sustentável.',
  [questions[2]]:
    'Comece comparando a dívida líquida com a geração de caixa e o EBITDA. Depois, olhe prazos, juros e a capacidade de pagamento: o contexto importa mais que um número isolado.',
  [questions[3]]:
    'Procure evidências que sustentem e que contrariem a hipótese: compare períodos, pares do setor, geração de caixa e eventos não recorrentes antes de formar uma conclusão.',
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
    <a className="brand" href="#inicio" aria-label="AçõesJA, início">
      <img src={brandLogo} alt="AçõesJA" />
    </a>
  )
}

function ProfessorAvatar({ small = false }: { small?: boolean }) {
  return <img className={small ? 'prof-avatar small' : 'prof-avatar'} src={brandIcon} alt="" />
}

function Modal({ kind, onClose }: { kind: Exclude<ModalKind, null>; onClose: () => void }) {
  const dialogRef = useRef<HTMLElement>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const details = useMemo(() => {
    if (kind === 'terms') return { eyebrow: 'AçõesJA', title: 'Termos de Uso', text: 'O texto oficial dos Termos de Uso será inserido aqui antes da publicação. Neste protótipo, este modal valida apenas a experiência de leitura sem abrir uma nova página.' }
    if (kind === 'privacy') return { eyebrow: 'AçõesJA', title: 'Política de Privacidade', text: 'O texto oficial da Política de Privacidade será inserido antes da publicação. No preview, perguntas não são enviadas; dados submetidos à lista de lançamento seguem o fluxo existente dessa lista.' }
    return { eyebrow: 'Professor IA', title: 'O lançamento ainda não está aberto.', text: 'Entre na lista para receber uma condição especial quando o Professor estiver disponível.' }
  }, [kind])

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current
    dialog?.querySelector<HTMLElement>('button, input, [href]')?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !dialog) return
      const focusable = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), [href]')]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown); previousFocus?.focus() }
  }, [onClose])

  const message = (reason: unknown) => reason && typeof reason === 'object' && 'message' in reason
    ? String(reason.message)
    : 'Não foi possível concluir agora. Tente novamente.'

  const submitWaitlist = async () => {
    if (!email.trim()) return setError('Informe seu melhor e-mail.')
    setLoading(true); setError('')
    try {
      await joinWaitlist({ name, email, whatsapp, marketingConsent })
      track('launch_list_joined', { marketing_consent: marketingConsent })
      setSubmitted(true)
    } catch (reason) { setError(message(reason)) } finally { setLoading(false) }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section ref={dialogRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar modal"><X size={20} /></button>
          <span className="eyebrow">{details.eyebrow}</span>
        <h2 id="modal-title">{details.title}</h2>
        <p>{details.text}</p>
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
        {submitted && <div className="submitted"><span><Check size={22} /></span><h3>Você está na lista.</h3><p>Seu cadastro foi salvo. Avisaremos você quando houver uma condição de lançamento.</p><button className="button button-dark wide" onClick={onClose}>Voltar para a página</button></div>}
      </section>
    </div>
  )
}

type ProfessorLoginModalProps = {
  code: string
  cooldown: number
  email: string
  error: string
  resending: boolean
  sending: boolean
  step: 'email' | 'code' | 'success'
  verifying: boolean
  onBack: () => void
  onChangeCode: (code: string) => void
  onChangeEmail: (email: string) => void
  onClose: () => void
  onResend: () => void
  onSubmitEmail: () => void
  onVerify: () => void
}

function ProfessorLoginModal({ code, cooldown, email, error, resending, sending, step, verifying, onBack, onChangeCode, onChangeEmail, onClose, onResend, onSubmitEmail, onVerify }: ProfessorLoginModalProps) {
  const dialogRef = useRef<HTMLElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const codeRef = useRef<HTMLInputElement>(null)
  const busy = sending || verifying || resending
  const canCloseRef = useRef(!busy)
  canCloseRef.current = !busy

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && canCloseRef.current) onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown); previousFocus?.focus() }
  }, [onClose])

  useEffect(() => {
    if (step === 'email') emailRef.current?.focus()
    if (step === 'code') codeRef.current?.focus()
  }, [step])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={() => { if (!busy) onClose() }}>
      <section ref={dialogRef} className="modal professor-login-modal" role="dialog" aria-modal="true" aria-labelledby="professor-login-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" disabled={busy} onClick={onClose} aria-label="Fechar login"><X size={20} /></button>
        <span className="eyebrow">Acesso seguro</span>
        {step === 'email' && <>
          <h2 id="professor-login-title">Entre para conversar com o Professor IA.</h2>
          <p>Sua pergunta ficará salva. Enviaremos um código de acesso de oito dígitos para o seu e-mail.</p>
          <form onSubmit={(event) => { event.preventDefault(); onSubmitEmail() }}>
            <label className="field-label" htmlFor="professor-login-email">Seu melhor e-mail</label>
            <input ref={emailRef} id="professor-login-email" type="email" value={email} onChange={(event) => onChangeEmail(event.target.value)} placeholder="voce@exemplo.com" autoComplete="email" disabled={busy} required />
            <button className="button button-dark wide" type="submit" disabled={busy}>{sending ? 'Enviando código…' : 'Receber código de acesso'} <ArrowRight size={17} /></button>
          </form>
        </>}
        {step === 'code' && <>
          <h2 id="professor-login-title">Verifique seu e-mail.</h2>
          <p id="professor-otp-help">Enviamos um código de acesso para:<strong className="professor-otp-email">{email}</strong></p>
          <form onSubmit={(event) => { event.preventDefault(); onVerify() }}>
            <label className="field-label" htmlFor="professor-login-code">Código de acesso</label>
            <input ref={codeRef} className="professor-otp-input" id="professor-login-code" type="text" inputMode="numeric" pattern={`[0-9]{${PROFESSOR_OTP_LENGTH}}`} maxLength={PROFESSOR_OTP_LENGTH} autoComplete="one-time-code" aria-describedby="professor-otp-help" value={code} onChange={(event) => onChangeCode(event.target.value.replace(/\D/g, '').slice(0, PROFESSOR_OTP_LENGTH))} placeholder="00000000" disabled={busy} required />
            <button className="button button-dark wide" type="submit" disabled={busy || code.length !== PROFESSOR_OTP_LENGTH}>{verifying ? 'Confirmando…' : 'Confirmar código'} <ArrowRight size={17} /></button>
          </form>
          <div className="professor-otp-actions">
            <button type="button" disabled={busy || cooldown > 0} onClick={onResend}>{resending ? 'Reenviando…' : cooldown > 0 ? `Reenviar código em ${cooldown}s` : 'Reenviar código'}</button>
            <button type="button" disabled={busy} onClick={onBack}>Alterar e-mail</button>
          </div>
        </>}
        {step === 'success' && <div className="submitted"><span><Check size={22} /></span><h3>Acesso confirmado.</h3><p>Sua pergunta está pronta. Você será levado de volta para ela.</p></div>}
        {error && <p className="form-error" role="alert">{error}</p>}
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
  const [professorState, setProfessorState] = useState<ProfessorState>({ kind: 'idle' })
  const [loginEmail, setLoginEmail] = useState('')
  const [loginCode, setLoginCode] = useState('')
  const [loginStep, setLoginStep] = useState<'email' | 'code' | 'success'>('email')
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpResending, setOtpResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [loginError, setLoginError] = useState('')
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginConfirmed, setLoginConfirmed] = useState(false)
  const otpRequestInFlight = useRef(false)
  const closeLogin = useCallback(() => setLoginOpen(false), [])

  const restorePendingQuestion = useCallback(() => {
    const pendingQuestion = window.localStorage.getItem(PENDING_PROFESSOR_QUESTION_KEY)
    setLoginOpen(false)
    setLoginStep('email')
    setLoginCode('')
    setProfessorState({ kind: 'idle' })
    if (pendingQuestion) {
      setLoginConfirmed(true)
      setQuery(pendingQuestion)
      window.localStorage.removeItem(PENDING_PROFESSOR_QUESTION_KEY)
      window.setTimeout(() => {
        document.getElementById('perguntar')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        document.getElementById('hero-question')?.focus()
      }, 150)
    }
  }, [])

  useEffect(() => {
    let active = true
    void initializeProfessorAuth().then((signedIn) => {
      if (active && signedIn) restorePendingQuestion()
    }).catch(() => {
      if (active) setProfessorState({ kind: 'error', message: 'Não foi possível restaurar sua sessão. Solicite um novo código de acesso.' })
    })
    return () => { active = false }
  }, [restorePendingQuestion])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timeout = window.setTimeout(() => setResendCooldown((seconds) => Math.max(0, seconds - 1)), 1_000)
    return () => window.clearTimeout(timeout)
  }, [resendCooldown])

  const openProfessor = () => {
    document.getElementById('perguntar')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => document.getElementById('hero-question')?.focus(), 350)
  }

  const selectQuestion = (question: string) => {
    setActiveQuestion(question)
    document.getElementById('demonstracao')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const startQuestion = async () => {
    const question = query.trim()
    if (!question) return
    setLoginConfirmed(false)
    setLiveAnswer('')
    track('professor_question_started', { question_length: question.length })
    if (!isOfficialProfessorEnabled) {
      setProfessorState({
        kind: 'preview-only',
        message: isGitHubPagesPreview
          ? 'Este GitHub Pages é somente uma demonstração simulada. Cookies de sessão cross-site não são usados.'
          : 'A integração real está preparada, mas permanece desativada até autorização do provider e do ambiente oficial.',
      })
      return
    }
    try {
      setProfessorState({ kind: 'checking-session' })
      if (!await hasProfessorSession()) {
        window.localStorage.setItem(PENDING_PROFESSOR_QUESTION_KEY, question)
        setProfessorState({ kind: 'idle' })
        setLoginError('')
        if (loginStep === 'success') setLoginStep('email')
        setLoginOpen(true)
        return
      }
      setProfessorState({ kind: 'asking' })
      const response = await askProfessor({ message: question, contextItems: [] })
      setLiveAnswer(response.message)
      setProfessorState({ kind: 'answered' })
      track('professor_question_answered', { conversation_id: response.conversationId })
    } catch (reason) {
      const state = professorErrorState(reason)
      if (state.kind === 'login') {
        window.localStorage.setItem(PENDING_PROFESSOR_QUESTION_KEY, question)
        setProfessorState({ kind: 'idle' })
        setLoginError('')
        if (loginStep === 'success') setLoginStep('email')
        setLoginOpen(true)
      } else {
        setProfessorState(state)
      }
      track('professor_question_failed', { state: state.kind })
    }
  }

  const sendOtp = async () => {
    if (otpRequestInFlight.current) return
    const normalizedEmail = loginEmail.trim().toLowerCase()
    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setLoginError('Informe um e-mail válido para receber o código de acesso.')
      return
    }
    otpRequestInFlight.current = true
    setOtpSending(true)
    setLoginError('')
    try {
      if (query.trim()) window.localStorage.setItem(PENDING_PROFESSOR_QUESTION_KEY, query.trim())
      await sendProfessorOtp(normalizedEmail)
      setLoginEmail(normalizedEmail)
      setLoginCode('')
      setLoginStep('code')
      setResendCooldown(60)
    } catch {
      setLoginError('Não foi possível enviar o código agora. Aguarde um momento e tente novamente.')
    } finally {
      otpRequestInFlight.current = false
      setOtpSending(false)
    }
  }

  const verifyOtp = async () => {
    if (otpRequestInFlight.current) return
    if (!/^\d{8}$/.test(loginCode)) {
      setLoginError('Digite os oito dígitos do código recebido por e-mail.')
      return
    }
    otpRequestInFlight.current = true
    setOtpVerifying(true)
    setLoginError('')
    try {
      await verifyProfessorOtp(loginEmail, loginCode)
      setLoginStep('success')
      window.setTimeout(restorePendingQuestion, 700)
    } catch {
      setLoginError('Código incorreto ou expirado. Confira os oito dígitos ou solicite um novo código.')
    } finally {
      otpRequestInFlight.current = false
      setOtpVerifying(false)
    }
  }

  const resendOtp = async () => {
    if (resendCooldown > 0 || otpRequestInFlight.current) return
    otpRequestInFlight.current = true
    setOtpResending(true)
    setLoginError('')
    try {
      await sendProfessorOtp(loginEmail)
      setLoginCode('')
      setResendCooldown(60)
    } catch {
      setLoginError('Não foi possível reenviar o código agora. Aguarde um momento e tente novamente.')
    } finally {
      otpRequestInFlight.current = false
      setOtpResending(false)
    }
  }

  const changeLoginEmail = () => {
    setLoginStep('email')
    setLoginCode('')
    setLoginError('')
  }

  const busy = professorState.kind === 'checking-session' || professorState.kind === 'asking'

  return (
    <main id="inicio">
      <div className="notice"><span>{isOfficialProfessorEnabled ? 'Professor IA pronto para ajudar' : 'Demonstração simulada · integração real desativada'}</span><a href="#perguntar">Faça sua primeira pergunta <ArrowRight size={14} /></a></div>
      <header className="header container">
        <Logo />
        <nav id="primary-navigation" className={menuOpen ? 'nav open' : 'nav'} aria-label="Navegação principal">
          <a href="#como-funciona" onClick={() => setMenuOpen(false)}>Como funciona</a>
          <a href="#demonstracao" onClick={() => setMenuOpen(false)}>Ver exemplos</a>
          <button className="nav-cta" onClick={() => { openProfessor(); setMenuOpen(false) }}>Usar o Professor <ArrowRight size={16} /></button>
        </nav>
        <button className="menu" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}><Menu size={24} /></button>
      </header>

      <section className="hero container" id="perguntar">
        <div className="hero-copy">
          <div className="product-label"><span className="pulse-dot" /> Entenda o que é e como funciona o Professor IA</div>
          <p className="hero-product">Seu guia educacional dentro do AçõesJA.</p>
          <h1>Escolha uma ação. Entenda o que os <em>números dela</em> querem dizer.</h1>
          <p>Faça perguntas sobre ações, indicadores e resultados. O Professor IA transforma conceitos do mercado em explicações claras para apoiar seu aprendizado.</p>
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
            <div><ProfessorAvatar /><div><strong>Professor IA</strong><small>{isOfficialProfessorEnabled && <i />} {isOfficialProfessorEnabled ? 'pronto para te ajudar' : 'preview sem provider'}</small></div></div>
            <span>{isOfficialProfessorEnabled ? 'Acesso oficial' : 'Demonstração simulada'}</span>
          </div>
          <div className="hero-professor-intro">
            <span>ENTENDA O QUE É E COMO FUNCIONA</span>
            <h2>Uma resposta que ajuda você a entender.</h2>
            <p>Pergunte do seu jeito. O Professor IA explica conceitos, indicadores e resultados com linguagem clara e foco educacional.</p>
          </div>
          <div className="question-box hero-question-box">
            <div className="question-box-head"><span><MessageCircle size={17} /> Pergunte ao Professor</span><small><LockKeyhole size={14} /> {isOfficialProfessorEnabled ? 'login por e-mail ao enviar' : 'preview sem sessão real'}</small></div>
            <label className="sr-only" htmlFor="hero-question">Sua pergunta</label>
            <textarea id="hero-question" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: A empresa X teve lucro. Por que a ação dela caiu?" maxLength={280} />
            <div className="question-suggestions" aria-label="Sugestões de perguntas">
              {questions.slice(0, 2).map((question) => <button key={question} type="button" onClick={() => setQuery(question)}>{question}</button>)}
            </div>
            <div className="question-box-bottom"><small>{query.length}/280</small><button className="button button-primary" disabled={busy || !query.trim()} onClick={startQuestion}>{busy ? 'Verificando...' : 'Perguntar agora'} <ArrowRight size={17} /></button></div>
            {loginConfirmed && <p className="professor-status professor-success" role="status">Login confirmado. Sua pergunta foi preservada e está pronta para enviar.</p>}
            {professorState.kind === 'checking-session' && <p className="professor-status" role="status">Verificando sua sessão oficial antes de enviar a pergunta…</p>}
            {professorState.kind === 'asking' && <p className="professor-status" role="status">O Professor está analisando sua pergunta…</p>}
            {['context-too-large', 'limited', 'provider-unavailable', 'error', 'preview-only'].includes(professorState.kind) && 'message' in professorState && <p className={`form-error question-error state-${professorState.kind}`} role="alert">{professorState.message}</p>}
            {liveAnswer && <article className="live-answer" aria-live="polite"><span>Professor IA</span><p>{liveAnswer}</p></article>}
          </div>
          <p className="hero-test-note"><Sparkles size={14} /> {isOfficialProfessorEnabled ? 'A resposta real exige login por e-mail.' : 'Este preview não chama provider e não substitui erros por respostas simuladas.'}</p>
        </div>
      </section>

      <section className="context-section container" id="como-funciona">
        <div><span className="eyebrow">Como o Professor ajuda</span><h2>Da ação escolhida à explicação que faz sentido.</h2></div>
        <p>O Professor parte dos dados da empresa selecionada para explicar a métrica no contexto daquele ativo e indicar o que vale investigar depois.</p>
        <div className="ecosystem-note" aria-label="Professor IA é a experiência de aprendizado do AçõesJA">
          <div><span>O ecossistema</span><strong>AçõesJA</strong></div>
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
          <article className="demo-chat" aria-label="Demonstração simulada do Professor IA">
            <div className="demo-chat-head"><div><ProfessorAvatar /><div><strong>Professor IA</strong><small>Demonstração simulada</small></div></div><span className="demo-badge">Demonstração simulada</span></div>
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

      <footer className="footer container"><Logo /><p>Professor IA é a experiência educacional do ecossistema AçõesJA. Não constitui recomendação de investimento.</p><div><button onClick={() => setModal('terms')}>Termos de Uso</button><button onClick={() => setModal('privacy')}>Política de Privacidade</button><span>© 2026 AçõesJA</span></div></footer>
      {modal && <Modal kind={modal} onClose={() => setModal(null)} />}
      {loginOpen && <ProfessorLoginModal code={loginCode} cooldown={resendCooldown} email={loginEmail} error={loginError} resending={otpResending} sending={otpSending} step={loginStep} verifying={otpVerifying} onBack={changeLoginEmail} onChangeCode={(code) => { setLoginCode(code); setLoginError('') }} onChangeEmail={(email) => { setLoginEmail(email); setLoginError('') }} onClose={closeLogin} onResend={resendOtp} onSubmitEmail={sendOtp} onVerify={verifyOtp} />}
    </main>
  )
}

export default App
