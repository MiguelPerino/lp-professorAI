# Protótipo — Professor IA | AçõesJá

Landing page de validação em React + TypeScript, construída a partir dos três documentos de produto recebidos.

## Escopo deste protótipo

- Landing page responsiva, com a marca AçõesJá e o Professor IA como experiência principal.
- Demonstração simulada por perguntas prontas, sem consumo de limite ou chamada a LLM.
- Campo para pergunta livre que abre um fluxo visual de autenticação.
- Modal de lista de lançamento (checkout simulado), Termos e Política de Privacidade.
- Nenhuma integração, dado ou lead real é enviado neste estágio.

## Pontos pendentes antes de produção

- Criar o projeto Supabase dedicado e configurar Auth, RLS e persistência.
- Integrar o contrato existente do Professor por um BFF Node.js, sem expor segredos.
- Configurar PostHog, eventos, UTMs e a persistência que antecede `launch_list_joined`.
- Receber os textos oficiais de Termos e Política de Privacidade.
- Definir limite de perguntas, oferta de lançamento, campos de lead e consentimento.

## Rodar localmente

```bash
pnpm install
pnpm dev
```

Para gerar a versão estática:

```bash
pnpm build
```

## Publicar no GitHub Pages

O workflow em `.github/workflows/deploy-pages.yml` publica automaticamente o site em cada push para a branch `main`.

Depois de enviar o projeto ao GitHub, abra **Settings → Pages** no repositório e, em **Build and deployment**, selecione **GitHub Actions**. Ao término da aba **Actions**, o endereço será:

```text
https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/
```
