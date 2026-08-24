# AçõesJa — Professor IA

O repositório está organizado por responsabilidade:

```text
web/       landing page React/Vite e integrações públicas do navegador
server/    BFF do Professor IA; concentra segredos, limite e persistência
supabase/  schema, RLS e funções SQL da base
design/    ativos visuais e referências de marca
```

## Primeiro setup

Requer Node.js 20 ou superior e pnpm 9. Depois:

1. Crie um projeto no Supabase e execute [bootstrap.sql](supabase/bootstrap.sql) no SQL Editor.
2. Em **Authentication → URL Configuration**, adicione `http://localhost:5173` em *Redirect URLs*. Para o Google, habilite o provedor e configure as credenciais no próprio Supabase.
3. Copie `web/.env.example` para `web/.env` e preencha somente `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_POSTHOG_KEY` e as URLs públicas necessárias.
4. Copie `server/.env.example` para `server/.env` e preencha as três variáveis do Supabase e o contrato do Professor. A `SUPABASE_SECRET_KEY` permanece exclusivamente aqui.
5. Instale as dependências e inicie os dois serviços:

```bash
pnpm install
pnpm dev
```

Caso use a URL direta do banco, o bootstrap também pode ser aplicado por:

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/bootstrap.sql
```

Para iniciar somente a interface:

```bash
pnpm dev:web
```

### Variáveis no GitHub Pages

O arquivo `web/.env.local` existe somente na máquina local e não é publicado. Em **Settings → Secrets and variables → Actions**, configure:

- Variables obrigatórias: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` e `VITE_SERVER_URL`.
- Variables opcionais: `VITE_POSTHOG_KEY` e `VITE_POSTHOG_HOST`.

Todos os valores `VITE_*` são incorporados ao JavaScript e ficam públicos no navegador. Portanto, não configure `SUPABASE_SECRET_KEY`, chaves do Professor IA ou qualquer outro segredo nesse workflow. O backend Node deve ser publicado em outro serviço HTTPS e sua URL pública deve ser informada em `VITE_SERVER_URL`.

No Supabase Dashboard, inclua `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/auth/callback` em **Authentication → URL Configuration → Redirect URLs**. O workflow também gera o fallback necessário para essa rota funcionar diretamente no GitHub Pages.

## Fluxos implementados

- Login por magic link e início de login Google pelo Supabase.
- Lista de lançamento persistida por uma função SQL pública e mínima; a tabela não pode ser lida pelo navegador.
- Eventos PostHog: `auth_magic_link_requested`, `auth_google_started`, `launch_list_joined`, `professor_question_started`, `professor_question_answered` e `professor_question_failed`.
- Pergunta livre enviada ao BFF somente com sessão Supabase válida. O BFF reserva cota diária, chama o provedor configurado, persiste pergunta e resposta, e devolve a cota se o provedor falhar.

## Contrato atual do Professor IA

`PROFESSOR_API_URL` deve receber `POST` com:

```json
{
  "question": "O que devo analisar?",
  "user_id": "uuid-do-usuario",
  "guardrails": ["educational_only", "no_investment_recommendations"]
}
```

E responder JSON contendo uma string em `answer`, `response`, `output_text`, `content` ou `text`. Quando o contrato definitivo estiver disponível, esse adaptador fica centralizado em `server/src/index.ts`.

## Segurança

- Nunca use `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PROFESSOR_API_KEY` ou outros segredos em `web/.env`.
- O `bootstrap.sql` habilita RLS nas tabelas sensíveis e concede a reserva de cota somente ao `service_role`.
- A anon key do Supabase e a chave de projeto do PostHog são deliberadamente públicas; as políticas e o BFF limitam o que elas podem fazer.
