# AçõesJá — Prompt para Refinamento Visual da LP do Professor IA

## Objetivo

Este documento deve ser lido pelo Codex/IA de coding **antes de alterar a landing page atual**.

A LP atual já possui uma estrutura considerada boa. **Não refazer a arquitetura da página do zero.**

O objetivo desta etapa é:

1. preservar a estrutura e UX que já funcionam;
2. incorporar a identidade visual do AçõesJá;
3. inserir corretamente a logo oficial;
4. aproximar a LP visualmente do produto principal AçõesJá;
5. aumentar a evidência visual do Professor IA no início da página;
6. manter a implementação simples e fácil de iterar.

---

# 1. Fonte de verdade

Considere os seguintes materiais, nesta ordem:

### A. Site principal

URL:

`https://www.acoesja.com.br/`

A LP deve parecer uma extensão natural do AçõesJá.

O produto principal atualmente apresenta:

- AçõesJá como marca principal;
- busca por ativo;
- análise de fundamentos;
- carteira;
- Professor IA;
- contexto para melhorar a explicação;
- linguagem de análise educacional;
- aviso de conteúdo educacional gerado por IA.

O site principal também apresenta o Professor como:

> Professor IA — guia educacional de análise

e comunica que contexto marcado ajuda a IA a responder de forma mais útil. Não transformar a LP em uma cópia do dashboard, mas reutilizar a linguagem visual e conceitual do produto.

### B. Logo oficial

Os assets enviados pela equipe são:

```text
Logo/Logo #U00cdcone branco.png
Logo/Logo #U00cdcone preto.png
Logo/Logo preta.jpeg
Logo/Logo branca.jpeg
```

A logo oficial possui o símbolo característico do AçõesJá em roxo.

### C. Considerações finais da LP

O arquivo de considerações aponta quatro mudanças principais:

- nesta validação pode ser pedido o nome da pessoa para continuar com o lançamento;
- o teste do Professor IA está pouco destacado e deve ficar maior e com um gancho mais forte;
- as perguntas de exemplo podem ser reformuladas para serem mais chamativas;
- a explicação de como o Professor funciona precisa ser maior e mais clara;
- os botões atuais do topo estão bons e podem ser mantidos;
- a estrutura geral do protótipo está boa;
- o principal trabalho visual restante é identidade, cores e logos.

**Não remover a estrutura atual só para atender essas mudanças.**

---

# 2. Regra principal

## Não recriar a LP

A versão atual já foi considerada boa em:

- estrutura;
- ordem geral das seções;
- navegação;
- botões superiores;
- fluxo de conteúdo.

Faça um **refinamento visual e de hierarquia**, não uma reconstrução.

Antes de editar:

1. inspecione todo o código atual;
2. identifique as seções existentes;
3. preserve componentes úteis;
4. preserve interações existentes;
5. preserve responsividade;
6. altere apenas o necessário.

---

# 3. Identidade AçõesJá

A página deve parecer:

> **AçõesJá + Professor IA**

e não:

> "uma landing page genérica de uma startup de IA".

## Direção visual

Usar:

- identidade roxa da marca;
- branco/preto conforme contexto;
- contraste forte;
- visual financeiro moderno;
- interface limpa;
- elementos de produto real;
- bordas e superfícies discretas;
- tipografia consistente;
- microinterações discretas.

Evitar:

- estética genérica de IA;
- robôs;
- cérebros;
- hologramas;
- excesso de gradientes;
- excesso de glow;
- visual cyberpunk;
- excesso de cards;
- elementos decorativos sem função;
- visual de template pronto.

A tecnologia deve aparecer através do **Professor funcionando**, e não através de decoração futurista.

---

# 4. Logo

Adicionar a logo oficial AçõesJá no topo da LP.

## Regras

- usar o asset oficial;
- não redesenhar a logo;
- não gerar outra logo com IA;
- não alterar as proporções;
- não aplicar efeitos artificiais;
- usar a versão adequada para fundo claro/escuro;
- manter boa área de respiro;
- manter tamanho visualmente equivalente ao produto principal.

Criar também favicon usando o símbolo da marca quando possível.

---

# 5. Header

Os botões atuais do topo foram considerados bons.

**Preservar a estrutura atual deles**, mas corrigir:

- logo;
- tipografia;
- espaçamento;
- alinhamento;
- cores;
- estados hover/focus;
- relação visual com a identidade AçõesJá.

Header esperado:

```text
[LOGO AÇÕES JÁ]                       [links/ações atuais]
```

O Professor deve aparecer como parte da marca:

```text
AçõesJá
Professor IA
```

e não como produto completamente separado.

---

# 6. Hero — maior prioridade

O principal problema identificado é que o teste do Professor IA está escondido.

O hero precisa deixar isso evidente imediatamente.

## Hierarquia desejada

```text
AÇÕES JÁ

PROFESSOR IA

headline forte

explicação curta

[ QUERO TESTAR O PROFESSOR ]

exemplos / preview da experiência
```

O usuário precisa entender nos primeiros segundos:

1. está no AçõesJá;
2. o destaque é o Professor IA;
3. ele pode experimentar;
4. o Professor ajuda a entender investimentos.

---

# 7. Hero — mensagem

Direção conceitual principal:

> **Entenda o contexto por trás dos seus investimentos.**

Subheadline:

> Pergunte ao Professor IA sobre ações, indicadores e acontecimentos do mercado e transforme dados difíceis em explicações simples.

CTA principal:

> **Testar o Professor IA**

Alternativas a testar:

> **Perguntar ao Professor**

> **Quero testar o Professor**

Não transformar o hero em um bloco gigante de texto.

---

# 8. Destaque visual do Professor

O Professor deve ocupar uma área visual maior do que na versão atual.

Criar uma representação clara de produto real.

Pode ser:

- interface de chat;
- painel de conversa;
- mockup de tela;
- composição com pergunta + resposta;
- card de conversa com contexto destacado.

Preferência:

**mostrar produto em funcionamento.**

Não criar uma ilustração abstrata de IA.

---

# 9. Demonstração

A demonstração deve continuar sem login.

Ela é um **preview simulado** da experiência real.

Exemplo:

```text
Você
Por que uma empresa pode ter lucro aumentando
e mesmo assim suas ações caírem?

Professor IA
O preço da ação não depende apenas do lucro atual...

Você
Então o que eu deveria investigar?

Professor IA
Você pode começar olhando...
```

A demonstração deve comunicar:

```text
dado
↓
contexto
↓
explicação
↓
investigação
↓
próxima pergunta
```

---

# 10. Perguntas de exemplo

As perguntas devem parecer dúvidas reais que despertariam curiosidade.

Evitar perguntas muito escolares/genéricas.

Preferir:

> "Como uma empresa pode dar lucro e a ação cair mesmo assim?"

> "P/L alto é sempre ruim?"

> "O que está por trás da dívida de uma empresa?"

> "O que eu deveria investigar antes de analisar uma ação?"

> "Por que o mercado reagiu dessa forma a essa empresa?"

> "Como eu descubro se esse indicador faz sentido para esta empresa?"

As perguntas podem aparecer como chips/cards clicáveis e acionar a demonstração simulada.

Não chamar o backend real ao clicar nesses exemplos durante a navegação pública.

---

# 11. Seção "Como funciona"

A explicação do Professor precisa ser mais clara e um pouco maior.

Direção:

```text
1. Você encontra um dado
2. O Professor explica o que ele significa
3. O contexto ajuda a relacionar o dado ao ativo
4. O Professor sugere o que investigar em seguida
```

Mensagem central:

> O Professor não serve apenas para responder. Ele ajuda você a entender o contexto e formular perguntas melhores.

Isso deve ser visualmente forte, mas sem virar uma seção excessivamente longa.

---

# 12. Relação Professor ↔ AçõesJá

Criar uma seção ou bloco deixando clara a relação:

```text
AÇÕES JÁ
O ecossistema

        ↓

PROFESSOR IA
A experiência de aprendizado e investigação
```

O usuário precisa perceber que:

> O Professor IA é o diferencial do AçõesJá.

Não fazer parecer que o Professor é outra empresa.

---

# 13. Cores

A paleta deve partir da identidade real do AçõesJá.

O logo oficial enviado possui o símbolo em tonalidade roxa.

Use o roxo da marca como cor de destaque principal.

Não inventar uma nova paleta desconectada da marca.

Usar:

- roxo da identidade;
- preto ou tons muito escuros para contraste;
- branco;
- tons neutros para superfícies;
- variações do roxo para estados e destaque, somente quando necessário.

Evitar:

- arco-íris;
- azul genérico de SaaS;
- roxo neon excessivo;
- dezenas de cores.

Criar tokens CSS centralizados, por exemplo:

```css
:root {
  --brand-primary: ...;
  --brand-primary-hover: ...;
  --surface: ...;
  --surface-muted: ...;
  --text: ...;
  --text-muted: ...;
  --border: ...;
}
```

Os valores exatos devem ser derivados dos assets/estilo já existente do AçõesJá, não inventados arbitrariamente.

---

# 14. Tipografia

Usar a mesma família tipográfica do produto principal quando ela já estiver disponível no projeto.

Se não estiver:

- escolher uma fonte sans-serif limpa e profissional;
- evitar fontes futuristas;
- evitar muitas famílias diferentes.

Hierarquia:

```text
headline grande
↓
subheadline legível
↓
texto curto
↓
microcopy
```

---

# 15. Botões

Preservar os botões atuais que já foram considerados bons.

Ajustar:

- cor;
- contraste;
- radius;
- padding;
- hover;
- focus;
- disabled;
- loading.

O CTA principal deve ter muito mais destaque que os CTAs secundários.

O CTA principal da LP deve ser claramente:

> **Testar o Professor IA**

---

# 16. Seção de contexto

A ideia de "contexto" deve virar um dos elementos visuais principais da identidade.

Exemplo:

```text
INDICADOR
     +
CONTEXTO
     ↓
ENTENDIMENTO
     ↓
INVESTIGAÇÃO
```

Pode ser apresentado com uma composição simples de UI.

Não transformar isso em um infográfico exagerado.

---

# 17. Mobile

O destaque do Professor não pode desaparecer no mobile.

No mobile:

```text
logo
↓
headline
↓
Professor / demonstração
↓
CTA principal
↓
explicação
```

A interação com o Professor deve continuar sendo visualmente a parte principal.

Garantir que:

- CTA fique visível;
- chat tenha boa leitura;
- perguntas exemplo sejam fáceis de tocar;
- logo não fique pequena;
- header não fique apertado.

---

# 18. Nome do visitante

As considerações da equipe indicam que pode ser interessante pedir o nome durante o fluxo de interesse/lançamento.

Não adicionar um campo grande no hero.

Preferir solicitar em contexto de cadastro/continuidade.

Exemplo:

> Como podemos chamar você?

Isso deve ser configurável porque ainda pode ser refinado após o teste.

---

# 19. Checkout

Não criar página separada.

Manter checkout como **modal**.

Fluxo:

```text
limite atingido
↓
mensagem
↓
"Quero continuar"
↓
modal
```

Não abrir automaticamente.

---

# 20. Termos e Política

Manter os botões no footer.

Abrir:

- Termos de Uso;
- Política de Privacidade;

em modais.

Não criar páginas novas.

---

# 21. Analytics

Não remover os eventos existentes da LP.

Preservar/garantir:

```text
hero_cta_clicked
example_question_clicked
professor_demo_viewed
use_professor_clicked
auth_started
auth_completed
question_started
question_submitted
professor_response_viewed
second_question_started
limit_reached
continue_clicked
checkout_viewed
launch_list_started
launch_list_joined
```

Não alterar o comportamento do evento `launch_list_joined`:

> ele só dispara depois que a persistência tiver sido concluída com sucesso.

---

# 22. O que não mudar

Não alterar sem necessidade:

- arquitetura geral da LP;
- fluxo de navegação;
- componentes que já funcionam;
- integração já funcional;
- layout estrutural aprovado;
- CTAs superiores aprovados;
- comportamento responsivo aprovado.

Foco desta tarefa:

> **branding + identidade visual + destaque do Professor + clareza da proposta.**

---

# 23. Processo de implementação

Antes de codar:

1. ler todo o projeto;
2. localizar `Header`;
3. localizar `Hero`;
4. localizar demonstração;
5. localizar exemplos;
6. localizar seção de explicação;
7. localizar footer;
8. localizar CSS/Tailwind/tokens;
9. localizar assets;
10. identificar como a logo atual está sendo carregada.

Depois:

1. adicionar logo oficial;
2. aplicar identidade AçõesJá;
3. ajustar cores;
4. ajustar tipografia;
5. aumentar a área visual do Professor;
6. reforçar CTA;
7. melhorar exemplos;
8. melhorar seção "como funciona";
9. revisar mobile;
10. preservar o restante.

---

# 24. Importante: usar os assets oficiais

Se os arquivos de logo estiverem disponíveis no repositório, reutilizá-los diretamente.

Se não estiverem, considerar que os arquivos oficiais fornecidos pela equipe são:

```text
Logo #U00cdcone branco.png
Logo #U00cdcone preto.png
Logo preta.jpeg
Logo branca.jpeg
```

Adicionar a versão apropriada ao diretório público de assets do projeto, preferencialmente:

```text
public/brand/
```

Não recriar a logo.

---

# 25. Resultado esperado

Ao terminar, o usuário deve sentir:

> "Isso é claramente AçõesJá."

e, imediatamente depois:

> "O Professor IA é a principal coisa que eu posso experimentar aqui."

A página atual já possui uma estrutura boa.

O resultado desta tarefa deve ser:

```text
estrutura atual
+
identidade AçõesJá
+
logo oficial
+
cores reais da marca
+
Professor muito mais evidente
+
hero mais forte
+
explicação mais clara
+
perguntas mais chamativas
```

Não criar uma LP completamente nova.

---

# 26. Critério de aceite visual

Considerar concluído somente quando:

- logo AçõesJá aparece corretamente;
- a paleta visual está coerente com a marca;
- o hero deixa claro que o Professor é o foco;
- o CTA "Testar o Professor IA" é evidente;
- a demonstração do Professor ocupa espaço suficiente;
- as perguntas exemplo geram curiosidade;
- a seção "Como funciona" explica claramente contexto → entendimento → investigação;
- os botões superiores atuais continuam funcionando;
- checkout continua sendo modal;
- Termos/Privacidade continuam no footer;
- mobile mantém a mesma hierarquia;
- não há estética genérica de "AI startup";
- nenhuma funcionalidade existente é quebrada.

---

# 27. Regra final

**Não tente impressionar com efeitos.**

A LP deve impressionar porque o produto parece bom.

A identidade deve vir do AçõesJá.

O Professor deve ser o protagonista.

A estrutura existente deve ser preservada.

A experiência deve continuar simples, rápida e orientada à validação.
