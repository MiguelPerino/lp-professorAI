# Refatoração do início da Landing Page — Professor IA do AçõesJa

## Objetivo desta tarefa

Refatorar **somente o início da landing page atual** para deixar muito mais explícito, logo nos primeiros segundos, que o foco principal da página é o **Professor IA do AçõesJa**.

A estrutura geral da LP foi considerada boa e deve ser preservada.

O problema atual é de **hierarquia e clareza no começo da página**:

- o Professor IA está pouco evidente;
- o usuário demora para entender exatamente o que ele é;
- o usuário demora para entender o que ele faz;
- o diferencial de contexto aparece tarde;
- as partes mais fortes da LP estão mais abaixo;
- o CTA de teste precisa ficar mais evidente no começo.

A missão é fazer o usuário entender o valor do Professor **antes de precisar rolar muito a página**.

---

# 1. Regra principal

## NÃO refazer a landing page inteira

Preservar:

- estrutura geral;
- seções já existentes;
- navegação;
- identidade visual atual;
- componentes;
- responsividade;
- integrações;
- eventos de analytics;
- modais;
- footer;
- fluxo de autenticação;
- comportamento do Professor;
- restante da LP que já funciona bem.

O foco desta tarefa é:

> **Hero + primeira dobra + primeira transição de conteúdo.**

Não transformar isso em um redesign completo.

---

# 2. O que precisa ficar claro em até 5 segundos

Ao abrir a página, o usuário precisa conseguir responder:

1. O que é o Professor IA?
2. O que ele faz?
3. Por que ele é diferente?
4. Como eu testo?

Se alguma dessas respostas ainda estiver escondida depois da refatoração, a tarefa não está concluída.

---

# 3. Hierarquia principal

O começo da página deve seguir aproximadamente esta ordem:

```text
AÇÕES JÁ
↓
PROFESSOR IA
↓
o que ele faz
↓
qual é o diferencial
↓
CTA para testar
↓
demonstração visual
```

O usuário não deve precisar descobrir o Professor apenas nas seções inferiores da página.

---

# 4. Hero

Refatorar o hero para que o Professor IA seja o protagonista.

## Selo / identificação

Acima da headline, adicionar algo como:

```text
Professor IA do AçõesJa
```

Isso deve funcionar como identificação do produto/diferencial.

---

## Headline principal

Usar como direção principal:

> **Entenda ações, indicadores e acontecimentos do mercado com o Professor IA.**

A headline deve ser direta e explícita.

Não usar uma headline tão conceitual que o usuário precise interpretar o que a página oferece.

---

## Subheadline

Usar como direção:

> Transforme dados difíceis em explicações simples. O Professor mostra o contexto por trás das informações e ajuda você a entender o que investigar em seguida.

A subheadline precisa explicar claramente:

- explicação;
- contexto;
- investigação.

---

# 5. CTA principal

O CTA principal precisa ser muito evidente.

Preferência:

> **Testar o Professor IA**

Alternativas possíveis:

> **Quero testar o Professor**

> **Perguntar ao Professor**

Escolher a opção que melhor combina com a interface atual.

O CTA principal deve ter mais peso visual do que qualquer CTA secundário nessa região.

---

# 6. CTA secundário

Adicionar ou preservar um CTA secundário de descoberta:

> **Ver como funciona**

Esse botão deve fazer scroll para a demonstração/explicação do Professor.

Não abrir página nova.

---

# 7. Demonstração no hero / primeira dobra

O Professor precisa ser mostrado visualmente funcionando já no início.

Em desktop, preferir um layout aproximadamente assim:

```text
┌─────────────────────────────┐   ┌─────────────────────────────┐
│ Professor IA do AçõesJa     │   │ PROFESSOR IA               │
│                             │   │                             │
│ Headline                    │   │ Você                        │
│                             │   │ "P/L alto é sempre ruim?"  │
│ Subheadline                 │   │                             │
│                             │   │ Professor                   │
│ [ Testar o Professor IA ]   │   │ "Não necessariamente..."   │
│ [ Ver como funciona ]       │   │                             │
└─────────────────────────────┘   └─────────────────────────────┘
```

Não copiar literalmente esse wireframe se a estrutura atual já tiver uma composição melhor.

O objetivo é apenas garantir:

> texto + produto funcionando

na primeira dobra.

---

# 8. Não usar ilustração genérica de IA

Não substituir a demonstração por:

- robô;
- cérebro;
- holograma;
- esfera abstrata;
- glow;
- visual futurista genérico;
- imagem decorativa de inteligência artificial.

Mostrar o **Professor como produto**, preferencialmente através da própria interface de conversa.

---

# 9. Perguntas de exemplo

As perguntas precisam gerar curiosidade e mostrar o diferencial de contexto.

Evitar perguntas excessivamente acadêmicas como simples definições.

Preferir dúvidas que parecem reais:

> **A empresa teve lucro. Então por que a ação caiu?**

> **P/L alto significa que uma ação está cara?**

> **Como eu sei se a dívida dessa empresa é preocupante?**

> **O resultado foi bom. O que eu deveria analisar agora?**

> **Por que o mercado reagiu dessa forma?**

> **Como descubro se esse indicador faz sentido para esta empresa?**

Esses exemplos devem reforçar que o Professor:

- não mostra apenas números;
- ajuda a interpretar;
- explica contexto;
- conduz investigação.

---

# 10. Comportamento das perguntas de exemplo

Antes do login:

- podem ser clicáveis;
- podem alterar a demonstração;
- podem mostrar uma resposta simulada;
- NÃO devem consumir o Professor real;
- NÃO devem exigir autenticação.

São uma demonstração.

Quando o usuário decidir escrever uma pergunta própria ou clicar em "Testar o Professor IA", seguir o fluxo real já definido no projeto.

Não alterar a regra de autenticação existente.

---

# 11. Nova seção imediatamente após o hero

Adicionar ou refatorar a primeira seção depois do hero para explicar rapidamente o diferencial.

Título sugerido:

> **Mais do que uma resposta. Contexto para você entender melhor.**

Estrutura recomendada:

### Entenda o dado

Saiba o que um indicador, resultado ou informação realmente significa.

### Entenda o contexto

Veja como aquele dado se relaciona com a empresa e com a situação analisada.

### Saiba o que investigar depois

O Professor ajuda você a transformar uma dúvida em uma análise mais completa.

---

# 12. Conceito central

A mensagem visual deve comunicar:

```text
DADO
↓
CONTEXTO
↓
EXPLICAÇÃO
↓
INVESTIGAÇÃO
↓
PRÓXIMA PERGUNTA
```

Esse conceito é mais importante do que simplesmente dizer "usamos IA".

---

# 13. Mensagem de posicionamento

O Professor não deve parecer:

> um chatbot genérico sobre investimentos.

Ele deve parecer:

> **uma ferramenta educacional do AçõesJa que ajuda o investidor a entender dados, contexto e o que investigar depois.**

Essa diferença precisa aparecer no texto e na interface.

---

# 14. Relação com o AçõesJa

Não esconder a marca.

Deixar claro desde o início:

> **Professor IA do AçõesJa**

A pessoa deve entender:

```text
AçõesJa = ecossistema
Professor IA = principal diferencial apresentado nesta LP
```

Não apresentar o Professor como empresa separada.

---

# 15. Primeira dobra

Em uma tela desktop comum, tentar deixar visíveis sem rolagem excessiva:

- logo AçõesJa;
- identificação Professor IA;
- headline;
- subheadline;
- CTA principal;
- parte significativa da demonstração.

No mobile:

```text
logo
↓
Professor IA
↓
headline
↓
subheadline
↓
CTA
↓
demonstração
```

Não esconder a demonstração muito abaixo no mobile.

---

# 16. Densidade de texto

Não transformar o início da página em um bloco enorme de explicação.

O princípio é:

```text
explicar pouco
+
mostrar muito
```

O aprofundamento pode continuar nas seções inferiores já existentes.

---

# 17. O restante da LP

Depois dessa nova introdução, continuar com a estrutura atual.

Não duplicar as seções inteiras que já existem.

Se uma seção inferior já explica detalhadamente algo que agora foi apresentado no início:

- manter o aprofundamento abaixo;
- usar o início apenas como preview/resumo.

---

# 18. Analytics

Preservar todos os eventos existentes.

Se necessário, garantir eventos para:

```text
hero_cta_clicked
see_how_it_works_clicked
example_question_clicked
professor_demo_viewed
use_professor_clicked
```

Não mudar nomes já existentes sem necessidade.

Se o projeto já tem convenção própria para os eventos, seguir a convenção atual.

---

# 19. Scroll do "Ver como funciona"

O CTA:

> **Ver como funciona**

deve fazer scroll suave até a seção correta.

Não adicionar router.

Não adicionar nova página.

Usar âncora/scroll dentro da LP.

---

# 20. Não alterar nesta tarefa

Não mexer, salvo se for necessário para suportar o novo hero:

- Supabase;
- PostHog;
- backend;
- API do Professor;
- limite de uso;
- checkout;
- persistência;
- autenticação;
- Termos;
- Política de Privacidade;
- regras de lead.

Esses itens fazem parte de outras etapas.

---

# 21. Procedimento antes de codar

Antes de fazer alterações:

1. ler este documento inteiro;
2. inspecionar o projeto atual;
3. localizar o componente do hero;
4. localizar a demonstração do Professor;
5. localizar os exemplos de perguntas;
6. localizar a primeira seção após o hero;
7. localizar os CTAs;
8. localizar os eventos de analytics;
9. localizar os estilos/tokens;
10. entender como a responsividade atual funciona.

Só depois alterar.

---

# 22. Critérios de aceite

A tarefa está concluída quando:

- [ ] o Professor IA aparece explicitamente na primeira dobra;
- [ ] fica claro que ele pertence ao AçõesJa;
- [ ] fica claro o que ele faz;
- [ ] fica claro que o diferencial é contexto + entendimento + investigação;
- [ ] o CTA "Testar o Professor IA" está evidente;
- [ ] existe uma demonstração visual forte já no início;
- [ ] exemplos de perguntas geram curiosidade;
- [ ] a primeira seção explica rapidamente como o Professor ajuda;
- [ ] o restante da LP foi preservado;
- [ ] nenhuma integração existente foi quebrada;
- [ ] desktop está bom;
- [ ] mobile está bom;
- [ ] não existe estética genérica de IA;
- [ ] não foram criadas páginas ou rotas desnecessárias.

---

# 23. Revisão final obrigatória

Depois de implementar, revisar a página como se fosse um visitante chegando pelo Instagram pela primeira vez.

Responder internamente:

1. Em 5 segundos eu sei o que é o Professor?
2. Em 5 segundos eu sei que ele pertence ao AçõesJa?
3. Eu sei o que ele faz?
4. Eu entendo por que contexto é importante?
5. Eu sei onde clicar para testar?
6. A demonstração desperta vontade de usar?
7. O começo me dá motivo para continuar rolando?

Se alguma resposta for "não", ajustar antes de encerrar.

---

# 24. Entrega

Ao finalizar, apresentar:

1. arquivos alterados;
2. resumo das mudanças;
3. mudanças específicas no hero;
4. mudanças nas perguntas;
5. mudanças na demonstração;
6. mudanças na primeira seção;
7. eventos preservados/adicionados;
8. confirmação de teste em desktop e mobile;
9. qualquer decisão que permaneceu pendente.

---

# Regra final

> **Não refaça a LP. Faça o Professor IA deixar de ser algo que o usuário descobre no final e transforme-o no motivo para o usuário querer continuar navegando desde o primeiro segundo.**
