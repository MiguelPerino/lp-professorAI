# AçõesJA — Professor IA

Landing page React/Vite desacoplada, com autenticação Supabase por código OTP e
chamada bearer direta ao backend AçõesJA.

## Estrutura

```text
web/       landing page, login Supabase, API direta e histórico local
supabase/  bootstrap da lista, cache educacional e eventos; Auth é gerenciado pelo Supabase
server/    stub 410 temporário para o projeto Vercel antigo
design/    ativos e referências da marca
```

As quatro combinações entre PETR4/ITUB4 e as duas perguntas padrão usam
respostas educacionais versionadas em `professor_standard_answers`, sem consumir
tokens do modelo. Perguntas livres exigem uma sessão Supabase. O frontend busca
o contexto disponível nas APIs públicas de cotação e histórico e envia o access
token somente em `Authorization` para `api.acoesja.com.br`; o backend valida a sessão, aplica
guardrails/limites e mede tokens. A conversa fica somente no `localStorage`,
isolada por `user.id`, e pode ser apagada na interface.

## Desenvolvimento

Requer Node.js 22 e pnpm 9.

```bash
pnpm install
cp web/.env.example web/.env
pnpm dev:web
```

Validação:

```bash
pnpm test
pnpm build
```

## Integração do Professor

O frontend usa `VITE_PROFESSOR_API_BASE` e chama diretamente:

- `POST /chat` com `{ message, conversationId? }`;
- `GET /usage/current-cycle` para exibir perguntas usadas no dia.

Ambas usam `credentials: "omit"` e bearer Supabase. Não existem cookies ou CSRF
do AçõesJA, BFF próprio, service role no navegador ou persistência remota das
conversas.

O login envia um OTP de oito dígitos pelo Supabase e valida o código com
`verifyOtp`; depois da confirmação, o SDK mantém e renova a sessão.

No Supabase hospedado, abra **Authentication → Email Templates → Magic Link**,
use o assunto `Seu código de acesso ao Professor IA` e cole o conteúdo de
`supabase/templates/professor-otp.html`. O template deve preservar
`{{ .Token }}`; usar `{{ .ConfirmationURL }}` transforma o mesmo fluxo em Magic
Link e deixa a interface de código incoerente. A geração, expiração e validação
do código permanecem sob responsabilidade do Supabase; o frontend aplica apenas
um cooldown visual de 60 segundos para reenvio.

O backend AçõesJA mantém allowlist CORS exata para o domínio alvo, Vercel e
GitHub Pages. Uma falha real nunca é substituída por exemplo simulado.

## Dados e validação da LP

`supabase/bootstrap.sql` é idempotente e prepara:

- PETR4 e ITUB4 no catálogo reduzido da demonstração;
- as duas perguntas padrão e quatro respostas especializadas;
- `lp_interaction_events`, sem texto livre, resposta ou contato pessoal;
- RPCs públicas estreitas para consultar resposta e registrar interação;
- nome e consentimento obrigatórios na função da lista de novidades.

Os eventos permitem validar hero, escolha de ativo, pergunta padrão, expansão
da resposta e conversão da lista. O PostHog continua recebendo os eventos de
produto existentes; campos digitados permanecem mascarados e não entram na
tabela de interações.

## GitHub Pages

O workflow pode executar o fluxo real quando as duas variáveis públicas do
Supabase estiverem configuradas no repositório. Os exemplos visuais continuam
explicitamente rotulados como demonstração simulada.

## Segurança

Variáveis `VITE_*` são públicas. A LP precisa somente de:

- `VITE_SUPABASE_URL`;
- `VITE_SUPABASE_PUBLISHABLE_KEY`;
- `VITE_PROFESSOR_API_BASE` (opcional; possui default produtivo);
- PostHog opcional.

Nunca adicione `SUPABASE_SECRET_KEY`, service role, chave do LLM ou outro
segredo ao projeto ou bundle. O antigo projeto Vercel `server` foi retirado da
operação e não participa da integração. A pasta versionada preserva somente o
stub `410 Gone`, sem secrets ou lógica ativa.
