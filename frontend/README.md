# Frontend — DoaBem

Interface web que consome a API REST do backend, feita em React + Vite.

## Como executar

Requisito: Node.js 20.19+ ou 22.12+.

```bash
cd frontend
npm install
npm run dev
```

A aplicação abre em http://localhost:5173.

### Com dados fictícios (padrão)

Sem configuração extra, o frontend usa um mock em memória e não precisa do backend. Todas as telas funcionam e um selo "dados fictícios" aparece no topo. Os dados voltam ao estado inicial ao recarregar a página.

### Com o backend

1. Suba o backend no perfil `dev`, que usa H2 em memória e cria usuários de demonstração. Ele roda em `localhost:8080`:

    ```bash
    cd backend/doabem
    ./mvnw spring-boot:run
    ```

2. Crie o `.env.local` a partir do exemplo e desligue o mock:

    ```bash
    cp .env.example .env.local
    ```

    ```env
    VITE_USE_MOCK=false
    ```

3. Rode `npm run dev`. O Vite repassa as chamadas `/api` para o endereço definido em `VITE_API_PROXY_TARGET`.

Por enquanto, estoque, solicitações, movimentações e dashboard aparecem como "em breve" nesse modo, porque ainda não têm endpoints no backend.

### Usuários de demonstração

Valem para os dois modos.

| Perfil      | E-mail                     | Senha        |
| ----------- | -------------------------- | ------------ |
| Coordenador | `coordenador@doabem.local` | `Doabem@123` |
| Operador    | `operador@doabem.local`    | `Doabem@123` |

### Variáveis de ambiente

| Variável                | Padrão                  | Descrição                         |
| ----------------------- | ----------------------- | --------------------------------- |
| `VITE_USE_MOCK`         | `true`                  | `false` usa a API real            |
| `VITE_API_URL`          | `/api`                  | Prefixo das chamadas à API        |
| `VITE_API_PROXY_TARGET` | `http://localhost:8080` | Para onde o Vite repassa o `/api` |

### Scripts

| Comando          | O que faz                            |
| ---------------- | ------------------------------------ |
| `npm run dev`    | Servidor de desenvolvimento          |
| `npm run build`  | Gera a versão de produção em `dist/` |
| `npm run lint`   | Verifica o código com oxlint         |
| `npm run format` | Formata o código com Prettier        |

## Referência visual

- Capturas do protótipo e guia visual: `docs/mockups/prototipo.md`
- Fluxo de telas e identidade visual: `docs/mockups/fluxo-telas.md`
- Protótipo navegável (dados fictícios): https://doabem-stock-hub.lovable.app/
- Figma (telas e guia de identidade visual): https://www.figma.com/design/Epm1g1xvCIwoikzaPzqoTf/Untitled?node-id=0-1
- Revisão do protótipo contra os requisitos: `docs/mockups/revisao-prototipo.md`

## Diretrizes

- Nenhuma regra de negócio relevante no JavaScript de tela; o backend valida e decide.
- Estados de carregamento, vazio, erro e sucesso em toda tela.
- Unidade (un, kg, L) sempre junto a quantidades e saldos; alerta crítico com texto, não só cor.
- Ações restritas ao Coordenador não aparecem para o Operador (o backend também nega com 403).
