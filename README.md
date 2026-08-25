# AçõesJá — Professor IA

Landing page React/Vite desacoplada, com autenticação Supabase por código OTP e
chamada bearer direta ao backend AçõesJá.

## Estrutura

```text
web/       landing page, login Supabase, API direta e histórico local
supabase/  bootstrap da lista de lançamento; Auth é gerenciado pelo Supabase
design/    ativos e referências da marca
```

O chat exige uma sessão Supabase. O frontend envia o access token somente em
`Authorization` para `api.acoesja.com.br`; o backend valida a sessão, aplica
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
do AçõesJá, BFF próprio, service role no navegador ou persistência remota das
conversas.

O login envia um OTP de oito dígitos pelo Supabase e valida o código com
`verifyOtp`; depois da confirmação, o SDK mantém e renova a sessão.

No Supabase, o template de e-mail deve exibir `{{ .Token }}`. A geração, expiração e validação do código permanecem sob responsabilidade do Supabase; o frontend aplica apenas um cooldown visual de 60 segundos para reenvio.

O backend AçõesJá mantém allowlist CORS exata para o domínio alvo, Vercel e
GitHub Pages. Uma falha real nunca é substituída por exemplo simulado.

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
segredo ao projeto ou bundle. O antigo projeto Vercel `server` não participa
mais do runtime e pode ser arquivado depois de confirmar o novo deploy.
