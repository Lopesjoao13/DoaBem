# Integração frontend ↔ backend

Use `VITE_USE_MOCK=false` no `frontend/.env` para falar com o backend real (proxy `/api` → `http://localhost:8080`). Login de dev: `coordenador@doabem.local` / `Doabem@123`.

## Integrado (rotas reais)
| Frontend | Backend |
|---|---|
| Login | `POST /api/auth/login` |
| Usuários | `/api/users` (CRUD + `PATCH /{id}/status`) |
| Categorias e itens | `/api/categories`, `/api/items` |
| Famílias (beneficiários) | `/api/beneficiaries` |
| Entradas de doação | `/api/donation-entries` |
| Estoque e ajustes | `GET /api/stock`, `POST /api/stock/adjustments` |
| Resumo de entregas e histórico da família | `GET /api/beneficiaries/{id}/delivery-summary`, `GET /api/beneficiaries/{id}/requests` |

## Rotas que faltam no backend (por categoria)

### Solicitações de ajuda
As tabelas e as entidades `AidRequest`, `AidRequestItem`, `Delivery` e `DeliveryItem` (com `AidRequestRepository` e `DeliveryRepository`) já existem; faltam serviço e controller.
| Rota | Função |
|---|---|
| `GET /api/requests` | Lista com filtro `status`; retorna `content` e `counts` por status |
| `GET /api/requests/{id}` | Detalhe com família, itens solicitados/aprovados e histórico |
| `POST /api/requests` | Criar `{beneficiaryId, lines:[{itemId, requestedQty}]}` |
| `POST /api/requests/{id}/decision` | Aprovar/recusar `{decision, items:[{id, approvedQty}], justification}` (COORDINATOR) |
| `POST /api/requests/{id}/pick` | Separar (reserva estoque) |
| `POST /api/requests/{id}/deliver` | Entregar `{notes}` (baixa estoque) |
| `POST /api/requests/{id}/cancel` | Cancelar `{reason}` (libera reserva) |

### Movimentações de estoque
`StockMovement` e `MovementResponse` existem, mas nenhum controller os expõe.
| Rota | Função |
|---|---|
| `GET /api/movements` | Lista paginada; filtros `from`, `to`, `itemId`, `type`, `userId`, `page`; linhas com `reference` e `reversedById` |
| `GET /api/movements/{id}` | Detalhe com `original` e `reversal` |
| `POST /api/movements/{id}/reverse` | Estorno `{justification, itemsReturned}` (COORDINATOR) |

### Dashboard
| Rota | Função |
|---|---|
| `GET /api/dashboard?from=&to=` | Contadores, `topCritical`, `recentMovements`, `pendingList`, `monthly`, `balanceByCategory`, `previous`, `generatedAt` |

### Usuários
| Rota | Função |
|---|---|
| `GET /api/users/options` | `{id, name}` para o filtro de movimentações (`/api/users` é só COORDINATOR) |

## Ajustes em rotas existentes
- Erros: o backend devolve `{status, message}`; o front espera também `fieldErrors` (campo → mensagem).
- `GET /api/donation-entries`: incluir `receivedItems:[{itemId, itemName}]` por entrada (filtro por item na tela de Entradas).
- Paginação (resolvido no front): o backend devolve `{content, page:{size,number,totalElements,totalPages}}`; o `httpClient` converte para `{content, page, size, totalElements, totalPages}` (formato do mock), então a tela de Movimentações não precisa de ajuste no backend.
- Definir tamanho máximo de página (o front pede `size=1000`).

## Observações
- O pacote `registry` (`FamilyController` e DTOs) foi removido do backend. O front usa `/api/beneficiaries`.
- `PATCH /api/beneficiaries/{id}/status` agora recusa inativar família com solicitação em andamento (pendente, aprovada ou separada), com mensagem de regra de negócio (D-09).

## Rotas de listagem: paginação e filtros (estado atual)
Todas paginam com `page`, `size` e `sort` (Spring `Pageable`), exceto `/api/stock`. O frontend pede `size=1000` e pagina, ordena e filtra no cliente (`DataTable`). O teto padrão do Spring Data é 2000 por página; acima disso o backend corta em silêncio.

| Rota | Tamanho padrão / ordem | Filtros no backend | Filtros que a tela usa e o backend não tem |
|---|---|---|---|
| `GET /api/users` | 20 / `name` | nenhum | busca (nome, e-mail), perfil, situação |
| `GET /api/categories` | 100 / `name` | `active` | nenhum (a tela não envia `active`) |
| `GET /api/items` | 20 / `name` | `search` (só nome), `status`, `categoryId` | busca por nome da categoria; a tela só envia `status` e filtra busca e categoria no cliente |
| `GET /api/beneficiaries` | 20 / `responsibleName` | `search` (só nome do responsável), `status` | busca por telefone e bairro; a tela só envia `status` |
| `GET /api/donation-entries` | 20 / `entryDate,id` desc | nenhum | período, registrado por, busca (id/origem), item |
| `GET /api/stock` | sem paginação (lista completa) | `status` | busca, categoria, nível (CRITICAL/LOW/NORMAL) |

### Pontos de atenção
- **Filtros no cliente:** o frontend pede `size=1000` e filtra, ordena e pagina no navegador. Funciona com pouco dado, mas a paginação do backend não é usada na prática.
- **Itens e famílias:** o backend já aceita `search` e `categoryId`, mas a tela só envia `status` e filtra o resto localmente.
- **Usuários e entradas:** não têm filtro no backend. Para filtrar no servidor, os filtros precisam ser criados lá, como já existem em itens e beneficiários.
- **Estoque:** sem paginação, o nível (`CRITICAL`/`LOW`/`NORMAL`) só pode ser filtrado no cliente.
- **Limite de página:** o teto padrão do Spring Data é 2000 por página; acima disso o backend corta em silêncio.
- **Busca de famílias:** na tela cobre nome, telefone e bairro; no backend, só o nome do responsável. Usar o `search` do backend faria a tela perder a busca por telefone e bairro.

### Filtros que as rotas novas vão precisar
- **`GET /api/requests`:** `status`, período, solicitante e busca (id e nome da família), conforme o mock.
- **`GET /api/movements`:** `from`, `to`, `itemId`, `type`, `userId` e `page`. É a única tela que lê `totalElements` e `totalPages` do servidor, então precisa do formato de paginação alinhado.
