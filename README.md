# AçõesJA — Professor IA

Landing page React/Vite conectada ao BFF do Professor IA com autenticação Supabase por código OTP enviado por e-mail.

## Estrutura

```text
web/       landing page, login Supabase e adapter do BFF
server/    BFF do Professor IA para Node.js/Vercel
supabase/  autenticação, persistência, limite diário e lista de lançamento
design/    ativos e referências da marca
```

O chat exige uma sessão Supabase. O frontend envia o access token somente no cabeçalho `Authorization` e o BFF valida a sessão antes de reservar cota, chamar o provider e persistir a conversa.

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

O frontend usa `VITE_ACOESJA_API_BASE` como origem do BFF e chama `POST /v1/professor/ask`. O login envia um OTP de seis dígitos pelo Supabase e valida o código com `verifyOtp`; depois da confirmação, o SDK mantém e renova a sessão no navegador e o adapter envia o access token como Bearer.

No Supabase, o template de e-mail deve exibir `{{ .Token }}`. A geração, expiração e validação do código permanecem sob responsabilidade do Supabase; o frontend aplica apenas um cooldown visual de 60 segundos para reenvio.

No backend, `CORS_ORIGIN` deve conter a origem exata do frontend, sem barra final. O provider configurado em `PROFESSOR_API_URL` deve aceitar o payload documentado em `server/.env.example`.

## GitHub Pages

`*.github.io` continua tratado como preview simulado mesmo que a flag real seja injetada por engano.

## Segurança

Variáveis `VITE_*` são públicas. Nunca adicione `SUPABASE_SECRET_KEY`, `PROFESSOR_API_KEY` ou qualquer segredo ao projeto `web`; essas variáveis pertencem somente ao projeto `server`.
