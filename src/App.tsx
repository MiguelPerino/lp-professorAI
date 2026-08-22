import { useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  LockKeyhole,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import brandLogo from '../design/Logo preta.jpeg'
import brandIcon from '../design/Logo Ícone preto.png'

type ModalKind = 'auth' | 'checkout' | 'terms' | 'privacy' | null

const questions = [
  'Como uma empresa pode dar lucro e a ação cair mesmo assim?',
  'P/L alto é sempre ruim?',
  'O que está por trás da dívida de uma empresa?',
]

const responses: Record<string, string> = {
  [questions[0]]:
    'Porque o mercado olha para o futuro, não apenas para o resultado atual. Se o lucro veio abaixo do esperado, houve pressão de custos ou as projeções para os próximos trimestres pioraram, a ação pode cair mesmo com um bom número no presente.',
  [questions[1]]:
    'Um P/L alto indica que o mercado está pagando mais por cada real de lucro da empresa. Isso pode refletir expectativa de crescimento — mas também pede que você investigue se esse crescimento parece sustentável.',
  [questions[2]]:
    'Comece comparando a dívida líquida com a geração de caixa e o EBITDA. Mais importante que olhar um número isolado é entender o prazo da dívida, os juros e a capacidade da empresa de pagá-la ao longo do tempo.',
}

const flowSteps = [
  {
    title: 'Dado',
    summary: 'Você encontra um número ou acontecimento.',
    explanationTitle: 'Comece pelo que chamou a sua atenção.',
    explanation: 'Pode ser uma queda na ação, um lucro que mudou, uma margem menor ou um indicador fora do padrão. O dado é o ponto de partida — não uma conclusão isolada.',
  },
  {
    title: 'Contexto',
    summary: 'O que mudou no ativo, setor ou mercado?',
    explanationTitle: 'Todo dado precisa de uma história ao redor.',
    explanation: 'O Professor ajuda a conectar o número ao momento da empresa, às expectativas do mercado, ao setor e aos acontecimentos que podem explicar a variação.',
  },
  {
    title: 'Explicação',
    summary: 'O Professor traduz o que isso pode significar.',
    explanationTitle: 'Entenda o significado antes de tirar conclusões.',
    explanation: 'Em linguagem simples, você descobre o que o indicador mede, por que ele importa e quais interpretações fazem sentido naquele contexto.',
  },
  {
    title: 'Investigação',
    summary: 'Ele mostra o que comparar e observar.',
    explanationTitle: 'A resposta abre caminhos para investigar melhor.',
    explanation: 'O Professor sugere comparações, períodos e perguntas complementares para que você não dependa de um único número ao analisar uma empresa.',
  },
  {
    title: 'Próxima pergunta',
    summary: 'Você aprofunda com mais clareza.',
    explanationTitle: 'Uma boa análise leva à próxima dúvida.',
    explanation: 'Com mais contexto, você formula perguntas mais específicas e continua aprendendo sobre o ativo de forma progressiva.',
  },
]

function Logo() {
  return (
    <a className="brand" href="#inicio" aria-label="AçõesJá, início">
      <img src={brandLogo} alt="AçõesJá" />
    </a>
  )
}

function ProfessorAvatar({ small = false }: { small?: boolean }) {
  return <img className={small ? 'prof-avatar small' : 'prof-avatar'} src={brandIcon} alt="" />
}

function Modal({ kind, onClose }: { kind: Exclude<ModalKind, null>; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false)
  const details = useMemo(() => {
    if (kind === 'terms') return { eyebrow: 'AçõesJá', title: 'Termos de Uso', text: 'O texto oficial dos Termos de Uso será inserido aqui antes da publicação. Neste protótipo, este modal valida apenas a experiência de leitura sem abrir uma nova página.' }
    if (kind === 'privacy') return { eyebrow: 'AçõesJá', title: 'Política de Privacidade', text: 'O texto oficial da Política de Privacidade será inserido aqui antes da publicação. Neste protótipo, nenhum dado enviado é armazenado.' }
    if (kind === 'auth') return { eyebrow: 'Professor IA', title: 'Continue para fazer sua pergunta', text: 'O Professor usa sua identificação para liberar a experiência e aplicar um limite individual de interações.' }
    return { eyebrow: 'Professor IA', title: 'O lançamento ainda não está aberto.', text: 'Entre na lista para receber uma condição especial quando o Professor estiver disponível.' }
  }, [kind])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar modal"><X size={20} /></button>
          <span className="eyebrow">{details.eyebrow}</span>
        <h2 id="modal-title">{details.title}</h2>
        <p>{details.text}</p>
        {kind === 'auth' && !submitted && <>
          <button className="google-button" onClick={() => setSubmitted(true)}><span>G</span> Continuar com Google</button>
          <div className="or"><i />ou<i /></div>
          <label className="field-label" htmlFor="auth-email">Seu e-mail</label>
          <input id="auth-email" type="email" placeholder="voce@exemplo.com" />
          <button className="button button-dark wide" onClick={() => setSubmitted(true)}>Continuar com e-mail <ArrowRight size={17} /></button>
          <small>Sem senha. Você receberia um link seguro para continuar.</small>
        </>}
        {kind === 'checkout' && !submitted && <>
          <label className="field-label" htmlFor="lead-name">Como podemos chamar você? <span>opcional</span></label>
          <input id="lead-name" type="text" placeholder="Seu nome" />
          <label className="field-label" htmlFor="lead-email">Seu melhor e-mail</label>
          <input id="lead-email" type="email" placeholder="voce@exemplo.com" />
          <label className="field-label optional" htmlFor="lead-whatsapp">WhatsApp <span>opcional</span></label>
          <input id="lead-whatsapp" type="tel" placeholder="(11) 99999-9999" />
          <label className="consent"><input type="checkbox" /> <span>Quero receber novidades do lançamento por e-mail.</span></label>
          <button className="button button-dark wide" onClick={() => setSubmitted(true)}>Quero receber a condição <ArrowRight size={17} /></button>
        </>}
        {submitted && <div className="submitted"><span><Check size={22} /></span><h3>Você está na lista.</h3><p>Este é um fluxo visual do protótipo. Em produção, o cadastro será persistido antes da confirmação.</p><button className="button button-dark wide" onClick={onClose}>Voltar para a página</button></div>}
      </section>
    </div>
  )
}

function App() {
  const [modal, setModal] = useState<ModalKind>(null)
  const [query, setQuery] = useState('')
  const [activeQuestion, setActiveQuestion] = useState(questions[0])
  const [activeFlowStep, setActiveFlowStep] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const selectQuestion = (question: string) => {
    setActiveQuestion(question)
    setAnswered(true)
    document.getElementById('demonstracao')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const startQuestion = () => {
    if (query.trim()) setModal('auth')
  }

  return (
    <main id="inicio">
      <div className="notice"><span>Uma nova forma de entender o mercado</span><a href="#demonstracao">Conheça o Professor IA <ArrowRight size={14} /></a></div>
      <header className="header container">
        <Logo />
        <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Navegação principal">
          <a href="#como-funciona" onClick={() => setMenuOpen(false)}>Como funciona</a>
          <a href="#demonstracao" onClick={() => setMenuOpen(false)}>Demonstração</a>
          <button className="nav-cta" onClick={() => { setModal('auth'); setMenuOpen(false) }}>Usar o Professor <ArrowRight size={16} /></button>
        </nav>
        <button className="menu" aria-label="Abrir menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={24} /></button>
      </header>

      <section className="hero container">
        <div className="hero-copy">
          <div className="product-label"><span className="pulse-dot" /> AçõesJá apresenta</div>
          <p className="hero-product">Professor IA <span>• guia educacional de análise</span></p>
          <h1>Entenda o contexto por trás dos seus <em>investimentos.</em></h1>
          <p>Pergunte sobre ações, indicadores e acontecimentos do mercado. O Professor transforma dados difíceis em explicações simples — e em perguntas melhores.</p>
          <div className="trust"><ShieldCheck size={18} /><span>Uma experiência educacional. Sem recomendações de compra ou venda.</span></div>
        </div>
        <div className="hero-visual" aria-label="Prévia da conversa com o Professor IA">
          <div className="visual-context">Dados do ativo <strong>+ contexto</strong></div>
          <div className="market-card"><span>IBOV · último pregão</span><strong>132.450 <b>+1,12%</b></strong><svg viewBox="0 0 300 68" preserveAspectRatio="none"><path d="M0 59 C18 53 20 60 33 50 S50 51 62 42 S78 50 88 31 S101 45 119 32 S136 40 152 24 S176 44 190 29 S209 35 226 15 S240 30 253 21 S273 26 300 7" /></svg></div>
          <article className="floating-chat">
            <div className="chat-top"><ProfessorAvatar /><div><strong>Professor IA</strong><small><i /> disponível para investigar</small></div><span className="more">•••</span></div>
            <div className="bubble user-mini">Por que a ação caiu mesmo com lucro?</div>
            <div className="bubble professor-mini">O lucro é só uma parte da história. Vamos olhar o que o mercado esperava?</div>
            <button onClick={() => document.getElementById('demonstracao')?.scrollIntoView({ behavior: 'smooth' })}>Ver explicação <ChevronRight size={15} /></button>
          </article>
          <div className="metric-card"><span>AçõesJá · Professor IA</span><strong>Entenda antes de decidir</strong></div>
        </div>
        <div className="hero-actions">
          <a className="button button-primary" href="#perguntar">Testar o Professor IA <ArrowDownRight size={18} /></a>
          <a className="text-link" href="#demonstracao">Ver demonstração <span>↗</span></a>
        </div>
      </section>

      <section className="question-strip" aria-labelledby="question-title">
        <div className="container">
          <p id="question-title"><Sparkles size={16} /> Comece por uma pergunta</p>
          <div className="question-pills">
            {questions.map((question) => <button key={question} onClick={() => selectQuestion(question)}>{question}<ArrowRight size={15} /></button>)}
          </div>
        </div>
      </section>

      <section className="context-section container" id="como-funciona">
        <div><span className="eyebrow">Como o Professor funciona</span><h2>Um dado é só o começo da investigação.</h2></div>
        <p>O Professor conecta o que você vê nos números ao contexto do ativo, explica o que importa e aponta a próxima pergunta que vale explorar.</p>
        <div className="ecosystem-note" aria-label="Professor IA é a experiência de aprendizado do AçõesJá">
          <div><span>O ecossistema</span><strong>AçõesJá</strong></div>
          <ArrowDownRight size={18} />
          <div><span>A experiência de aprendizado</span><strong>Professor IA</strong></div>
        </div>
        <div className="flow" aria-label="Dado leva a contexto, explicação, investigação e próxima pergunta">
          {flowSteps.map((step, index) => <button key={step.title} type="button" className={`flow-item ${activeFlowStep === index ? 'active' : ''}`} aria-pressed={activeFlowStep === index} onClick={() => setActiveFlowStep(index)}><span>0{index + 1}</span><strong>{step.title}</strong><p>{step.summary}</p>{index < 4 && <ArrowRight className="flow-arrow" size={18} />}</button>)}
        </div>
        <article className="flow-explainer" aria-live="polite">
          <span>Etapa {activeFlowStep + 1} · {flowSteps[activeFlowStep].title}</span>
          <h3>{flowSteps[activeFlowStep].explanationTitle}</h3>
          <p>{flowSteps[activeFlowStep].explanation}</p>
        </article>
      </section>

      <section className="demo-section" id="demonstracao">
        <div className="container demo-layout">
          <div className="demo-intro"><span className="eyebrow">Professor IA em ação</span><h2>Não é uma resposta pronta. É um caminho para investigar.</h2><p>Veja como uma dúvida real se transforma em contexto, explicação e uma próxima pergunta mais inteligente.</p><div className="demo-stat"><Clock3 size={18} /><span>Em poucos minutos, transforme uma dúvida em um caminho de análise.</span></div></div>
          <article className="demo-chat">
            <div className="demo-chat-head"><div><ProfessorAvatar /><div><strong>Professor IA</strong><small>Uma demonstração simulada</small></div></div><span className="demo-badge">AçõesJá</span></div>
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

      <section className="interactive-section container" id="perguntar">
        <div className="interactive-copy"><span className="eyebrow">Teste o Professor IA</span><h2>Qual é a sua dúvida hoje?</h2><p>Escreva uma pergunta para experimentar o guia educacional de análise do AçõesJá.</p><ul><li><Check size={16} /> Explicações simples, sem jargão</li><li><Check size={16} /> Foco em contexto e investigação</li><li><Check size={16} /> Limite de experiência por pessoa</li></ul></div>
        <div className="question-box">
          <div className="question-box-head"><span><MessageCircle size={17} /> Pergunte ao Professor</span><small><LockKeyhole size={14} /> login na próxima etapa</small></div>
          <label className="sr-only" htmlFor="question">Sua pergunta</label>
          <textarea id="question" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: O que devo olhar antes de analisar uma empresa?" maxLength={280} />
          <div className="question-box-bottom"><small>{query.length}/280</small><button className="button button-dark" onClick={startQuestion}>Continuar <ArrowRight size={17} /></button></div>
          {answered && <p className="preview-note"><CircleHelp size={16} /> Você viu uma demonstração acima. Para fazer uma pergunta livre, continue com seu e-mail.</p>}
        </div>
      </section>

      <section className="launch-section">
        <div className="container launch-content"><div><span className="eyebrow light">O próximo passo</span><h2>Quando o Professor estiver disponível, você quer continuar a conversa?</h2></div><button className="button button-light" onClick={() => setModal('checkout')}>Quero receber a condição de lançamento <ArrowRight size={18} /></button></div>
      </section>

      <footer className="footer container"><Logo /><p>Professor IA é a experiência educacional do ecossistema AçõesJá. Não constitui recomendação de investimento.</p><div><button onClick={() => setModal('terms')}>Termos de Uso</button><button onClick={() => setModal('privacy')}>Política de Privacidade</button><span>© 2026 AçõesJá</span></div></footer>
      {modal && <Modal kind={modal} onClose={() => setModal(null)} />}
    </main>
  )
}

export default App
