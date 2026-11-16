# Testes do frontend

## Comandos (pasta `frontend`)
| Comando | O que roda |
|---|---|
| `npm test` | Testes unitários e de tela (Vitest + Testing Library + MSW), sem backend |
| `npm run test:watch` | O mesmo, em modo observação |
| `npm run test:contract` | Testes de contrato contra o backend real (padrão `http://localhost:8080`; mude com `CONTRACT_API_URL`) |

Os testes de contrato se pulam sozinhos se o backend não estiver no ar. Para subir o backend em Docker, sem instalar Java:

```
cd backend/doabem
docker run --rm --name doabem-backend -p 8080:8080 -v "$PWD":/app -v doabem-m2:/root/.m2 -w /app maven:3.9-eclipse-temurin-21 mvn -q spring-boot:run
```

O banco H2 fica em memória e persiste entre execuções enquanto o container estiver no ar; os testes usam nomes únicos por execução.

## Camadas
| Camada | Arquivos | O que valida |
|---|---|---|
| HTTP | `src/services/httpClient.test.js` | token, query sem valores vazios, paginação do Spring achatada, erros, `fieldErrors` aninhados, 401 |
| Rotas | `src/services/apiRoutes.test.js` | cada função de service: método, caminho, query e corpo (todas as rotas do backend) |
| Mock | `src/services/mock/mockContract.test.js` | o mock devolve o mesmo formato do backend |
| Cache | `src/lib/queryClient.test.js`, `src/hooks/*.test.jsx` | `useFetch`, `useForm`, `useAsyncAction`, invalidação por `meta.invalidates` |
| Telas | `src/pages/*/*.test.jsx` | login, famílias, entradas, estoque, solicitações, movimentações, usuários, dashboard, com a API simulada por MSW |
| Utilitários | `src/utils/utils.test.js` | quantidades, validação, busca, CSV, paginação |
| Contrato | `tests/contract/*.test.js` | todas as rotas contra o backend real: formato (`src/test/shapes.js`), permissões, validação, regras de negócio, estoque, filtros e paginação |

`src/test/shapes.js` descreve o formato de cada resposta e é usado tanto pelos testes do mock quanto pelos de contrato.
