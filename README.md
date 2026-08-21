# Sysorkap — ERP não fiscal

Sistema ERP hospedado 100% em **Netlify Functions** (serverless), com **Express** rodando dentro das funções, views renderizadas no servidor com **EJS**, estilizadas com **Tailwind CSS v4** e banco **MongoDB** via **Mongoose**.

> **Estado atual:** fundação pronta — configuração, arquitetura, camadas e estrutura de páginas. **Nenhuma lógica de negócio implementada** (decisão do projeto). Este guia mostra onde está cada coisa e exatamente como construir cada parte.

---

## 1. Stack

| Camada | Tecnologia | Onde |
|---|---|---|
| Plataforma | Netlify Functions (runtime v4) | `netlify/functions/` |
| Servidor | Express 4 + `serverless-http` | dentro de cada função |
| View engine | EJS | `netlify/functions/site/views/` |
| Estilo | Tailwind CSS v4 (CLI) | `css/tailwind.css` → `public/css/tailwind.css` |
| Banco | MongoDB Atlas + Mongoose 9 | `config/database.ts` |
| Linguagem | TypeScript (ESM, strict) | `tsconfig.json` |

---

## 2. Comandos

| Comando | O que faz |
|---|---|
| `npm install` | Instala dependências |
| `npm run dev` | Sobe o servidor local em `http://localhost:8888` (lê o `.env`) |
| `npm run typecheck` | Valida tipos de todo o código TS |
| `npm run css` | Compila o Tailwind em modo **watch** (desenvolvimento) |
| `npm run css:build` | Compila o Tailwind minificado (produção) |
| `npm run build` | `css:build` + `typecheck` — roda no deploy |
| `npm run db:create` | Cria o banco MongoDB (idempotente) |
| `npm run seed:usuarios` | Cria usuários na collection `usuarios` (default: admin1/admin2; ou `-- email senha [email senha...]`) |
| `npm run hash-password` | Gera hash scrypt de uma senha (uso geral) |
| `npm run deploy` | Deploy de produção via Netlify CLI |

---

## 3. Estrutura completa

```
sysorkap/
├── netlify.toml                    # Config do Netlify (build, functions, redirects)
├── package.json                    # Scripts e dependências
├── tsconfig.json                   # TypeScript (ESM, strict)
├── .env                            # Variáveis locais (NÃO versionado)
├── .env.example                    # Modelo das variáveis (versionado)
├── .gitignore
├── css/
│   └── tailwind.css                  # Entrada do Tailwind (v4, CSS-first)
├── public/
│   └── css/
│       └── tailwind.css            # CSS compilado (gerado) — servido como estático
├── scripts/
│   ├── db-create.ts                  # Cria o banco MongoDB (roda direto, sem build)
│   ├── seed-usuarios.ts              # Cria/atualiza usuários na collection usuarios
│   ├── hash-password.ts              # Gera hash scrypt p/ senhas
│   └── generate-routes.ts            # Gera routes.generated.ts (roteamento por pastas)
└── netlify/
    └── functions/                  # = uma função serverless por subpasta
        ├── health/                 # FUNÇÃO 1 — heartbeat da aplicação
        │   └── health.ts           # GET /api/health
        └── site/                   # FUNÇÃO 2 — o "app" principal (páginas do ERP)
            ├── site.ts             # Entrypoint: exporta handler = serverless(app)
            ├── app.ts              # Cria o Express: middlewares + registerRoutes() + 404
            ├── routes.generated.ts # AUTO-GERADO pelo gerador de rotas (não editar)
            ├── config/
            │   ├── env.ts          # Leitura tipada das variáveis de ambiente
            │   └── database.ts     # Conexão Mongoose (lazy + cacheada p/ serverless)
            ├── helpers/
            │   ├── paths.ts        # Resolve o diretório de views (dev/prod)
            │   ├── render.ts       # renderPage(): helper de renderização de páginas
            │   ├── nav.ts          # Dados do menu (seções, ícones, rotaAtiva) — fonte única
            │   └── route-handler.ts# Tipo RouteHandler dos handlers de rota
            ├── utils/              # Funções globais puras (só o que está em uso)
            │   ├── response.ts     # jsonOk/jsonError — padrão de resposta JSON
            │   ├── password.ts     # hashSenha/verificarSenha (scrypt + timingSafeEqual)
            │   ├── jwt.ts          # signJwt/verifyJwt (HS256, sem dependências)
            │   └── cookie.ts       # Cookie de sessão HttpOnly (ler/definir/limpar)
            ├── middleware/
            │   ├── strip-prefix.ts # Normaliza o path recebido do Netlify
            │   └── auth.ts         # requireAuth: valida JWT do cookie, protege rotas
            ├── controllers/        # Roteamento por pastas: pasta = URL, arquivo = verbo
            │   ├── get.ts          # GET /
            │   ├── login/          # /login
            │   │   ├── get.ts      # GET /login (redireciona / se já autenticado)
            │   │   └── post.ts     # POST /login (autentica e emite JWT)
            │   ├── logout/
            │   │   └── post.ts     # POST /logout (limpa o cookie)
            │   ├── estoque/        # GET / (visão geral), /novo (form), POST / (cria no banco)
            │   ├── saidas/         # GET /saidas; /saidas/novo
            │   ├── relatorios/
            │   │   └── get.ts      # GET /relatorios
            │   ├── clientes/       # idem saidas
            │   ├── fornecedores/   # idem saidas
            │   └── _errors.ts      # 404 (prefixo _ = ignorado pelo gerador)
            ├── models/             # Contratos de dados (interfaces TS)
            │   ├── schemas/        # Schemas Mongoose (entidades persistidas)
            │   │   ├── usuario.schema.ts
            │   │   └── produto.schema.ts   # usuarioId + SKU único por conta
            │   ├── cliente.model.ts
            │   ├── fornecedor.model.ts
            │   └── movimentacao.model.ts
            ├── repositories/       # Acesso a dados
            │   ├── base.repository.ts      # Base genérica (in-memory)
            │   ├── usuario.repository.ts   # Mongo-backed (login)
            │   ├── produto.repository.ts   # Mongo-backed (listar/criar por usuário)
            │   ├── *.repository.ts         # Demais entidades (in-memory por enquanto)
            │   └── index.ts                # Instâncias prontas (singleton)
            └── views/              # Templates EJS
                ├── partials/       # Trechos reutilizáveis
                │   ├── head.ejs
                │   ├── sidebar.ejs
                │   └── topbar.ejs
                └── pages/          # Páginas (1 por rota)
                    ├── auth/login.ejs
                    ├── dashboard/index.ejs
                    ├── estoque/{index,form}.ejs
                    ├── entradas/{index,form}.ejs
                    ├── saidas/{index,form}.ejs
                    ├── relatorios/index.ejs
                    ├── clientes/{index,form}.ejs
                    ├── fornecedores/{index,form}.ejs
                    └── notfound.ejs
```

---

## 4. Arquitetura — responsabilidade de cada camada

### 4.1 Fluxo de uma requisição

```
Navegador → /estoque
  → netlify.toml: redirect "/*" → /.netlify/functions/site/:splat
  → Netlify invoca a função site (bundle esbuild)
  → site.ts → serverless(app)
  → app.ts
      → middlewares (json, urlencoded)
      → strip-prefix("site")  → converte /.netlify/functions/site/estoque em /estoque
      → routes.generated.ts (gerado) → app.get("/estoque", controllers/estoque/get.ts)
  → controllers/estoque/get.ts → renderPage("estoque/index")
  → helpers/render.ts → res.render("pages/estoque/index", { titulo })
  → EJS monta: head.ejs + sidebar.ejs + tabbar.ejs + topbar.ejs + conteúdo
```

### 4.2 O papel de cada camada

| Camada | Responsabilidade | Regra de ouro |
|---|---|---|
| `site.ts` | **Só** exportar o handler. Nada mais. | Não colocar lógica aqui |
| `app.ts` | Criar/ligar o Express: middlewares, `registerRoutes()`, 404 | Não registrar rotas manualmente aqui |
| `controllers/` (pastas) | **Pasta = URL, arquivo = verbo HTTP** (`get.ts`, `post.ts`...), export default | Sem acesso direto ao banco — usa repository |
| `routes.generated.ts` | Registro das rotas (auto-gerado) | Nunca editar — rode `npm run routes:generate` |
| `repositories/` | Toda consulta/escrita de dados | É onde o banco real entra no futuro |
| `models/` | Tipos/contratos das entidades | Sem implementação, só interface + tipos |
| `config/env.ts` | Centralizar variáveis de ambiente | Nunca ler `process.env` fora daqui |
| `config/database.ts` | Conexão Mongoose | Sempre usar `connectDatabase()` |
| `helpers/` | Infraestrutura do app (render, paths, tipos de rota) | Sem estado, sem dependência de rotas |
| `utils/` | Funções globais puras p/ controllers | **Só criar quando houver uso real** — sem código especulativo |
| `middleware/` | Lógica transversal (prefixo, futuramente auth) | Rodar antes das rotas |
| `views/pages/` | Página completa (HTML + EJS) | 1 arquivo por rota |
| `views/partials/` | Blocos reutilizados (head, sidebar, topbar) | Incluir via `<%- include %>` |

---

## 5. Rotas atuais do ERP

| Rota | Controller (arquivo) | View | Módulo |
|---|---|---|---|
| `GET /` | `controllers/get.ts` | `dashboard/index.ejs` | Dashboard |
| `GET /login` | `controllers/login/get.ts` | `auth/login.ejs` | Autenticação |
| `POST /login` | `controllers/login/post.ts` | — (JSON) | Autenticação |
| `POST /logout` | `controllers/logout/post.ts` | — (redirect) | Autenticação |
| `GET /estoque` | `controllers/estoque/get.ts` | `estoque/index.ejs` | Estoque |
| `GET /estoque/novo` | `controllers/estoque/novo/get.ts` | `estoque/form.ejs` | Estoque |
| `GET /entradas` | `controllers/entradas/get.ts` | `entradas/index.ejs` | Entradas |
| `GET /entradas/novo` | `controllers/entradas/novo/get.ts` | `entradas/form.ejs` | Entradas |
| `GET /saidas` | `controllers/saidas/get.ts` | `saidas/index.ejs` | Saídas |
| `GET /saidas/novo` | `controllers/saidas/novo/get.ts` | `saidas/form.ejs` | Saídas |
| `GET /relatorios` | `controllers/relatorios/get.ts` | `relatorios/index.ejs` | Relatórios |
| `GET /clientes` | `controllers/clientes/get.ts` | `clientes/index.ejs` | Clientes |
| `GET /clientes/novo` | `controllers/clientes/novo/get.ts` | `clientes/form.ejs` | Clientes |
| `GET /fornecedores` | `controllers/fornecedores/get.ts` | `fornecedores/index.ejs` | Fornecedores |
| `GET /fornecedores/novo` | `controllers/fornecedores/novo/get.ts` | `fornecedores/form.ejs` | Fornecedores |
| `GET /api/health` | — (função `health`) | — | Heartbeat |
| `GET /*` (inexistente) | `controllers/_errors.ts` | `notfound.ejs` | 404 |

### 5.1 Convenções do roteamento por pastas

- **Pasta = caminho da URL:** `controllers/clientes/` → `/clientes`
- **Arquivo = verbo HTTP:** `get.ts`, `post.ts`, `put.ts`, `patch.ts`, `delete.ts` — um arquivo por método, com **export default**
- **Subcaminho = subpasta:** `/clientes/novo` → `controllers/clientes/novo/get.ts`
- **Rotas dinâmicas:** pasta `[param]` → `:param` — ex.: `controllers/clientes/[id]/get.ts` → `GET /clientes/:id`
- **Arquivos/pastas com prefixo `_`** são ignorados pelo gerador (ex.: `_errors.ts`)
- O gerador roda sozinho no `npm run dev` e no `npm run build`; para rodar à mão: `npm run routes:generate`

### 5.2 Autenticação

- **Usuários:** collection `usuarios` no MongoDB (`email` único + `senhaHash` scrypt). Crie usuários com `npm run seed:usuarios -- "email" "senha"` (idempotente — não sobrescreve senha existente).
- **Fluxo:** `POST /login` (JSON: `email`, `senha`, `lembrar`) → busca o usuário no banco → verifica scrypt → emite **JWT HS256** no cookie `sysorkap_token` (**HttpOnly**, `SameSite=Lax`, `Secure` em produção). O `sub` do token é o `_id` do usuário — é a chave do isolamento por conta (multi-tenant). "Lembrar de me" = 30 dias; sem isso, sessão de 8h.
- **Proteção:** o middleware `middleware/auth.ts` roda antes das rotas — tudo exige token, exceto as rotas listadas em `ROTAS_PUBLICAS`. GET sem auth → redirect `/login`; API sem auth → 401 JSON. O id do usuário autenticado fica em `res.locals.usuarioId`.
- **Senhas:** scrypt (crypto nativo, sem dependências) + `timingSafeEqual`. Hash extra gerável com `npm run hash-password`.
- **Logout:** `POST /logout` limpa o cookie e redireciona para `/login`.
- **Produção:** a app se recusa a subir sem `SESSION_SECRET` (≥32 chars).

---

## 6. Banco de dados (MongoDB + Mongoose)

### 6.1 Conexão

- **Arquivo:** `netlify/functions/site/config/database.ts`
- `connectDatabase()` — conecta **lazy** e **cacheia a promise** (reusa a conexão em instâncias quentes — essencial em serverless para reduzir cold starts)
- `disconnectDatabase()` — encerra (uso em testes/scripts)

Uso nos controllers/repositories:

```ts
import { connectDatabase } from "../config/database";

await connectDatabase();
// agora use seus models/repositories
```

### 6.2 Variáveis

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DB_URL` | sim | URL `mongodb+srv://...` |
| `DB_NAME` | não (default `sysorkap`) | Nome do banco |
| `NODE_ENV` | não | `development` / `production` |
| `APP_NAME` | não | Nome do app |
| `SESSION_SECRET` | sim (produção) | Chave HMAC do JWT (≥32 chars; app não sobe sem ela em produção) |

- **Local:** edite o `.env` (o `netlify dev` lê automaticamente)
- **Produção:** Netlify → Site → **Site configuration → Environment variables**
- **Modelo versionado:** `.env.example`

### 6.3 Criar o banco e os usuários

```bash
npm run db:create
npm run seed:usuarios
```

- `db:create` cria o banco `sysorkap` com uma collection placeholder `_init` (o MongoDB apaga bancos sem collections; o placeholder garante que ele exista). **Idempotente** — se você já criou collections, ele remove o `_init` sozinho.
- `seed:usuarios` cria os usuários na collection `usuarios` (default: `admin1@gmail.com` e `admin2@gmail.com`, senha `123`). **Idempotente** — `$setOnInsert` não sobrescreve senha de usuário já existente. Para outros usuários: `npm run seed:usuarios -- "email" "senha"`.
- **Onde adicionar suas collections:** bloco comentado em `scripts/db-create.ts`:

```ts
// ============================================
// AQUI: crie suas collections
// Exemplo: await db.createCollection("produtos");
// ============================================
```

### 6.4 Schemas e collections

A entidade **Usuário já está no Mongo**: `models/schemas/usuario.schema.ts` (collection `usuarios`, `email` único + `senhaHash`), acessada por `repositories/usuario.repository.ts`.

Os **demais models** (`models/*.model.ts`) ainda são **interfaces TypeScript** — contratos de dados, não schemas do Mongo. Para persisti-las, crie schemas Mongoose na mesma pasta `models/schemas/`:

```ts
import { Schema, model } from "mongoose";

const produtoSchema = new Schema({
  nome: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  quantidadeAtual: { type: Number, default: 0 },
}, { timestamps: true });

export const ProdutoModel = model("Produto", produtoSchema);
```

> O Netlify considera **cada subpasta** de `netlify/functions/` como uma função. Não crie pastas soltas lá — coloque tudo dentro de `netlify/functions/site/`.

---

## 7. Modelos e repositórios existentes

### 7.1 Models (contratos)

| Arquivo | Entidade | Campos principais |
|---|---|---|
| `schemas/usuario.schema.ts` | Usuário (**Mongo**) | email (único), senhaHash |
| `cliente.model.ts` | Cliente | nome, documento, email, telefone, endereco |
| `fornecedor.model.ts` | Fornecedor | razaoSocial, documento, email, telefone, endereco |
| `produto.model.ts` | Produto | nome, sku, categoria, unidade, precoCusto, precoVenda, quantidades |
| `movimentacao.model.ts` | Movimentação | tipo (`entrada`/`saida`), produtoId, quantidade, observacao, data |

Os models de interface exportam: a interface + `NovoX` (sem id/timestamps) + `AtualizacaoX` (parcial).

### 7.2 Repositories (acesso a dados)

- `base.repository.ts` — genérico com operações **in-memory** (`findAll`, `findById`, `create`, `update`, `remove`, `clear`). É o ponto de partida para conectar ao Mongo.
- Cada repository estende a base e adiciona buscas específicas (ex.: `produtoRepository.findBySku`, `usuarioRepository.findByEmail`).
- `repositories/index.ts` — expõe instâncias únicas prontas:

```ts
import { repositories } from "../repositories";

repositories.produtos.findAll();
repositories.produtos.findBySku("SKU-001");
repositories.produtos.create({ nome: "Caneta", sku: "SKU-002" });
```

> **Migração para o Mongo:** troque a implementação interna dos repositories para usar os schemas Mongoose — os controllers **não precisam mudar** (esse é o objetivo da camada).

---

## 8. Guia prático — como criar cada coisa

### 8.1 Nova página simples (ex.: `/configuracoes`)

1. **View:** `views/pages/configuracoes/index.ejs` — copie a estrutura de qualquer página existente (head + sidebar + topbar + `<main>`)
2. **Controller:** `controllers/configuracoes/get.ts`

```ts
import type { RouteHandler } from "../../helpers/route-handler";
import { renderPage } from "../../helpers/render";

const handler: RouteHandler = (_req, res) => {
  renderPage(res, "configuracoes/index", { active: "configuracoes" });
};

export default handler;
```

3. **Gerar rota:** `npm run routes:generate` (ou só reinicie o `npm run dev` — ele já gera)
4. **Menu:** adicionar o item em `helpers/nav.ts` (array `secoesNav`) — sidebar desktop, tabbar mobile e bottom sheet são gerados a partir dele
5. O redirect `/*` do `netlify.toml` já entrega a URL — **nada a fazer lá**

### 8.2 Novo módulo completo (ex.: Compras)

1. Model: `models/compra.model.ts` (interface + Novo + Atualizacao)
2. Repository: `repositories/compra.repository.ts` + registrar em `repositories/index.ts`
3. Controllers: `controllers/compras/get.ts` e `controllers/compras/novo/get.ts`
4. Views: `views/pages/compra/{index,form}.ejs`
5. `npm run routes:generate`
6. Menu em `helpers/nav.ts` (array `secoesNav`)

### 8.3 Novo endpoint de API (JSON)

As funções `health` e `site` são apps Express. Para APIs JSON:

- **Dentro do app ERP:** crie uma pasta com um arquivo-verbo (ex.: `controllers/produtos/post.ts`) e responda com `jsonError` (de `utils/response.ts`) ou `res.json(...)` direto. O app já tem `express.json()` ativo.
- **Função separada (ex.: `netlify/functions/api/`):** crie a pasta com seu próprio Express + `serverless(app)` + middleware `stripPrefix("api")`, e adicione o redirect correspondente no `netlify.toml`.

### 8.4 Nova collection no banco

No bloco comentado de `scripts/db-create.ts`:

```ts
await db.createCollection("compras");
```

### 8.5 Nova variável de ambiente

1. Adicione em `config/env.ts` (com default)
2. Adicione ao `.env` local e ao `.env.example`
3. Adicione no painel do Netlify (produção)

---

## 9. Tailwind CSS v4

- **Entrada:** `css/tailwind.css` — contém `@import "tailwindcss"` e a diretiva `@source` que varre as views:

  ```css
  @source "../netlify/functions/site/views/**/*.ejs";
  ```

- **Tema:** o bloco `@theme` define tokens customizados (ex.: `--color-primary` → usado como `bg-primary`, `focus:ring-primary`; `--font-sans` → **Poppins**, carregada via Google Fonts em `partials/head.ejs`)
- **Regra:** classes novas em `pages/*.ejs` ou `partials/*.ejs` são detectadas automaticamente — só não esqueça de rodar `npm run css` (watch) ou `npm run css:build`
- **Output:** `public/css/tailwind.css` (pasta `public/` é o `publish` do Netlify — estáticos são servidos direto, sem passar pela função)

---

## 10. Configurações-chave

### 10.1 `netlify.toml`

```toml
[build]
  command = "npm run css:build && npm run typecheck"   # o que roda no deploy
  functions = "netlify/functions"                      # onde ficam as functions
  publish = "public"                                   # estáticos (CSS)

[functions]
  node_bundler = "esbuild"                             # bundle das functions
  external_node_modules = ["express"]                  # express fora do bundle

[functions.site]
  included_files = ["netlify/functions/site/views/**"] # copia as views junto do bundle
```

Redirects (ordem importa):

```toml
[[redirects]]
  force = true
  from = "/api/*"          # APIs → função correspondente
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  force = true
  from = "/"               # raiz → função site
  to = "/.netlify/functions/site"
  status = 200

[[redirects]]
  from = "/*"              # catch-all das páginas → função site (sem force, para o CSS estático continuar servido)
  to = "/.netlify/functions/site/:splat"
  status = 200
```

> **Atenção:** regras com `from` começando em `/.netlify` são **inválidas** no Netlify — o runtime já roteia esses caminhos nativamente.

### 10.2 `tsconfig.json`

- `module: ESNext` + `moduleResolution: bundler` (projeto ESM)
- `strict: true`, `noEmit: true` (o bundle é do esbuild do Netlify)
- `include`: `netlify/functions/**/*.ts` **e** `scripts/**/*.ts` — não remova o segundo (o editor precisa dele para tipar o `db-create.ts`)

---

## 11. Deploy

### Local

```bash
npm install
npm run db:create     # se ainda não criou o banco
npm run dev           # http://localhost:8888
```

### Produção (dashboard Netlify)

1. Push do repositório → New site from Git → importar
2. Build command: `npm run css:build && npm run typecheck` (já está no `netlify.toml`)
3. Publish directory: `public` (já configurado)
4. **Variáveis de ambiente** em Site configuration → Environment variables: `DB_URL`, `DB_NAME`, `NODE_ENV=production`, `SESSION_SECRET` (valor forte)

### Produção (CLI)

```bash
npm run deploy
```

---

## 12. Troubleshooting

| Sintoma | Causa provável | Solução |
|---|---|---|
| `import.meta.url` undefined no dev | O dev server compila para CJS | Já tratado em `helpers/paths.ts` (fallback para `process.cwd()`) — não remover o try/catch |
| Página retorna 404 no dev | Rota não gerada (controller novo sem `routes:generate`) ou o controller não renderiza | Rodar `npm run routes:generate` e conferir passo 8.1 |
| CSS novo não aparece | Tailwind não recompilado | Rodar `npm run css` (watch) |
| `dbName: any` / erro de `ConnectOptions` | Arquivo fora do projeto TS ou TS Server desatualizado | Conferir `tsconfig.json` (include com `scripts/`) e reiniciar o TS Server (Ctrl+Shift+P → Restart TS Server) |
| Erro "path must not start with /.netlify" | Regra de redirect inválida | Remover a regra (ver 10.1) |
| Banco some do Atlas | MongoDB apaga banco sem collections | Rodar `npm run db:create` de novo (recria o `_init`) |
| `res.setHeader is not a function` | Exportou o app Express direto, sem `serverless-http` | Usar `export const handler = serverless(app)` |
| Porta 3999/8888 em uso | Processo `netlify dev` anterior não morreu | `Stop-Process` nos processos `node` do netlify e rodar de novo |

---

## 13. Roadmap sugerido (ordem de implementação)

1. **Schemas Mongoose** para as demais entidades (`models/schemas/`) e collections em `scripts/db-create.ts` — *usuário já feito*
2. **Repositories no Mongo** — trocar a base in-memory pelos models Mongoose (controllers não mudam); **isolar dados por usuário** (`usuarioId` em cada documento, filtro via `res.locals.usuarioId`)
3. **Estoque** — CRUD de produtos (listagem, formulário, validação)
5. **Movimentações** — entradas/saídas atualizando `quantidadeAtual` do produto
6. **Clientes/Fornecedores** — CRUD
7. **Relatórios** — consultas agregadas (Mongo aggregation) e exportação
8. **Dashboard** — indicadores com dados reais

---

## 14. Checklist de revisão

- [x] Configuração base: `netlify.toml`, `tsconfig.json`, `package.json`, `.gitignore`
- [x] Ambiente: `.env` / `.env.example`, `config/env.ts` (todas as variáveis centralizadas)
- [x] Função `health` (heartbeat) — `GET /api/health`
- [x] Função `site` com Express + EJS + serverless-http
- [x] Views: partials (head, sidebar, topbar) + 15 páginas placeholder + 404
- [x] Rotas/controllers para todos os módulos do ERP
- [x] Middleware `strip-prefix` (dev + prod)
- [x] Helpers: `paths.ts` (dev/prod), `render.ts` e `nav.ts` (dados do menu)
- [x] Navegação: sidebar dark com submenus acordeão (desktop) + tabbar com bottom sheet (mobile), tema dark responsivo
- [x] Autenticação: login JWT (HS256, cookie HttpOnly), scrypt p/ senha, middleware `requireAuth`, logout, usuários no Mongo (`seed:usuarios`)
- [x] Tailwind v4 configurado (`@source` nas views, tema customizado, scripts)
- [x] Mongoose configurado (conexão lazy/cacheada)
- [x] Script `db:create` (banco criado no Atlas, placeholder `_init`)
- [x] Models (5 entidades) e repositories (base + 5) com instâncias prontas
- [x] Redirects: `/api/*`, `/`, `/*` (ordem correta, sem regras `/.netlify` inválidas)
- [x] Typecheck passando (projeto + `scripts/`)
- [x] README cobrindo todos os pontos acima

---

*Documentação gerada em 19/08/2026 — atualize este guia sempre que adicionar uma camada nova.*