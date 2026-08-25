# AçõesJá — Professor IA

Landing page React/Vite preparada para o chat educacional autenticado do AçõesJá. A integração real permanece desligada: não há deploy, provider ativado, segredo ou identidade local neste repositório.

## Estrutura

```text
web/       landing page e adapter do backend oficial
server/    protótipo legado de BFF, mantido sem alterações nesta integração
supabase/  infraestrutura legada da lista de lançamento
design/    ativos e referências da marca
```

O chat da LP não usa o BFF legado nem Supabase Auth. A lista de lançamento ainda usa a função pública mínima existente no Supabase; isso é separado da identidade do Professor.

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

## Integração oficial, desligada por padrão

A origem planejada da experiência real é `https://professor.acoesja.com.br`. A base produtiva preparada em `web/.env.example` é `https://api.acoesja.com.br/api` e sempre vem da variável pública `VITE_ACOESJA_API_BASE`.

O gate `VITE_PROFESSOR_REAL_ENABLED` permanece `false`. Antes de alterá-lo, são necessários CORS exato para a origem same-site, provider autorizado e as URLs/rotas oficiais abaixo:

- `VITE_ACOESJA_LOGIN_URL`: URL oficial de login;
- `VITE_ACOESJA_POLICIES_URL`: URL oficial de aceite de políticas;
- `VITE_ACOESJA_REFRESH_PATH`: caminho oficial de refresh, relativo à base.

Esses três valores não constam do contrato candidato. Portanto, ficam vazios e o cliente falha fechado: não inventa endpoint, não simula login e não repete uma chamada autenticada sem refresh oficial. O adapter já serializa o refresh e limita cada solicitação a um refresh e um retry quando o caminho for publicado.

O protocolo implementado usa somente cookies HttpOnly gerenciados pelo AçõesJá:

- todas as chamadas enviam `credentials: "include"`;
- mutações obtêm `GET /auth/csrf` e enviam o nome/token devolvido pelo servidor;
- `POST /ai/chat` envia apenas `message`, `conversationId` opcional e `contextItems`;
- nenhum access/refresh token é lido, armazenado ou enviado pela LP;
- erros de login, políticas, contexto, limite e provider permanecem visíveis e nunca caem em fixture;
- a UI exibe apenas tokens absolutos devolvidos pela resposta, sem porcentagem ou saldo inventado.

## GitHub Pages

`*.github.io` é sempre tratado como preview simulado, mesmo que a flag real seja injetada por engano. Cookies `SameSite=Lax` da API são cross-site nesse host, então o workflow fixa `VITE_PROFESSOR_REAL_ENABLED=false`. A fixture está rotulada “Demonstração simulada”.

## Segurança

Variáveis `VITE_*` são públicas. Nunca adicione chaves privadas, tokens, credenciais de provider ou secrets. A ativação, deploy, CORS, DNS, provider e custos permanecem fora do escopo desta LP e exigem autorização específica.
