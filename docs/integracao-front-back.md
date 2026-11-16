# Integração frontend ↔ backend

Use `VITE_USE_MOCK=false` no `frontend/.env` para falar com o backend real (proxy `/api` → `http://localhost:8080`). Login de dev: `coordenador@doabem.local` / `Doabem@123`.

Todas as chamadas passam pelo TanStack Query (`useFetch` → `useQuery`; `useForm`, `useAsyncAction` e login → `useMutation`). Toda escrita bem-sucedida invalida o cache.

## Rotas integradas (todas as do backend atual)
| Frontend | Backend |
|---|---|
| Login | `POST /api/auth/login`, `GET /api/auth/me` |
| Usuários | `/api/users` (CRUD, `GET /{id}`, `PATCH /{id}/status`), `GET /api/users/options` |
| Categorias e itens | `/api/categories`, `/api/items` (CRUD, `GET /{id}`, `PATCH /{id}/status`) |
| Famílias (beneficiários) | `/api/beneficiaries` (CRUD, status), `GET /{id}/delivery-summary`, `GET /{id}/requests` |
| Entradas de doação | `/api/donation-entries` |
| Estoque e ajustes | `GET /api/stock`, `POST /api/stock/adjustments` |
| Solicitações | `GET /api/requests`, `GET /{id}`, `POST /api/requests`, `POST /{id}/decision`, `/pick`, `/deliver`, `/cancel` |
| Movimentações | `GET /api/movements`, `GET /{id}`, `POST /{id}/reverse` |
| Dashboard | `GET /api/dashboard?from=&to=` |

`getUser`, `getCategory`, `getItem` e `getCurrentUser` existem nos services, mas nenhuma tela os usa.

## Adaptações feitas no frontend
- **Paginação:** o backend devolve `{content, page:{size,number,totalElements,totalPages}}`; o `httpClient` converte para `{content, page, size, totalElements, totalPages}` (formato do mock).
- **Erros por campo:** o backend devolve `fieldErrors` com chaves planas (`lines[0].itemId`, `approved.12`, `justification`); o `httpClient` converte em objetos aninhados (`errors.lines[0].itemId`, `errors.approved[12]`), como os formulários esperam.
- **Movimentações:** o frontend envia `size=10` (o backend usa 20 por padrão).

## Regras do backend úteis para o front
- `PATCH /api/beneficiaries/{id}/status` recusa inativar família com solicitação em andamento (pendente, aprovada ou separada), D-09.
- `GET /api/requests` aceita `status`, `from`, `to`, `requestedById` e `search` (id, `#id` ou nome da família) e devolve `counts` por status mais `ALL`.
- `GET /api/movements` aceita `from`, `to`, `itemId`, `type` e `userId`, e devolve `reference` e `reversedById`.

## Pendências
- **Formato de erro de entradas:** `POST /api/donation-entries` valida `items[n].campo`, e o formulário de entradas usa `lines[n]`. Erros de campo vindos do servidor podem não aparecer no campo certo; conferir ao testar.
- **Filtros no cliente:** o frontend pede `size=1000` e filtra, ordena e pagina no navegador. O backend já aceita filtros que a tela não envia:

| Rota | Filtros no backend | Filtros que a tela usa e o backend não tem |
|---|---|---|
| `GET /api/users` | nenhum | busca, perfil, situação |
| `GET /api/categories` | `active` | nenhum (a tela não envia `active`) |
| `GET /api/items` | `search` (só nome), `status`, `categoryId` | busca por nome da categoria |
| `GET /api/beneficiaries` | `search` (só nome do responsável), `status` | busca por telefone e bairro |
| `GET /api/donation-entries` | nenhum | período, registrado por, busca (id/origem), item |
| `GET /api/requests` | `status`, `from`, `to`, `requestedById`, `search` | a tela filtra período, solicitante (por nome) e busca no cliente |
| `GET /api/stock` | `status` (sem paginação) | busca, categoria, nível |

- **Limite de página:** o teto padrão do Spring Data é 2000 por página; acima disso o backend corta em silêncio.
