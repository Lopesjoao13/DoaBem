# Checklist de Aceite — Sprint 01 (DoaBem)

Situação em 06/10/2026. `[x]` = pronto nesta pasta; `[ ]` = depende do grupo ou do repositório.

## Repositório e organização
- [ ] Repositório criado e todos os integrantes adicionados
- [ ] `@profesestito` com acesso para revisar o PR
- [ ] Branches `main` e `develop` existem e a estratégia de trabalho foi combinada
- [ ] Estrutura inicial do repositório organizada (`/backend`, `/frontend`, `/docs`)
- [x] `README.md` criado/atualizado

## Stack e arquitetura
- [x] Backend registrado como Java 21 + Spring Boot 3.x
- [ ] Banco, build, frontend, autenticação e ferramenta de mockup confirmados pelo grupo (propostas em `docs/arquitetura.md`)
- [x] Integração frontend/backend/banco descrita em alto nível
- [x] Diagrama de contexto e diagrama de arquitetura

## Requisitos
- [x] Atores, escopo e fora de escopo definidos
- [x] Requisitos funcionais (RF01 a RF38), regras de negócio (RN01 a RN29) e não funcionais (RNF01 a RNF10)
- [x] Critérios de aceite em Dado/Quando/Então (CA01 a CA11)
- [x] Respostas do PO incorporadas (Q01 a Q22)
- [x] Dúvidas remanescentes registradas (D-01 a D-11)

## Fluxo de telas e mockups
- [x] Perfis/atores listados (Operador, Coordenador)
- [x] Telas por perfil definidas (9 telas mínimas do PO)
- [x] Mapa/fluxo de navegação
- [x] Identidade visual inicial (nome, cores, tipografia)
- [x] Capturas reais do protótipo e guia de identidade visual em `docs/mockups/prototipo.md` (7 telas e 4 quadros de marca)
- [ ] Protótipo atualizado com os ajustes das respostas do PO (`docs/mockups/revisao-prototipo.md`)
- [ ] Telas que faltam capturadas (nova entrada, solicitação com análise, separação e entrega, movimentações, usuários)
- [ ] Fluxo completo demonstrável no protótipo (entrada → solicitação → aprovação → separação → entrega)
- [ ] Mockups cobrem o MVP sem funcionalidades fora de escopo

## DER
- [x] Entidades e atributos definidos
- [x] PK e FK indicadas
- [x] Relacionamentos e cardinalidades definidos
- [x] Restrições registradas (banco x aplicação)
- [x] Saldo não é atributo digitado (derivado de movimentações)
- [x] DER confrontado com as regras de negócio e com os cenários exigidos pelo PO
- [x] DER em Mermaid versionado em `docs/der/der.md`
- [ ] DER revisado e aprovado pelo grupo (responsável: Eduardo)

## Coerência entre artefatos
- [ ] Mockup × DER × arquitetura × requisitos conferidos na sincronização do grupo
- [x] Nenhum item fora de escopo incluído nos requisitos e no DER

## Registro e entrega
- [x] Decisões e dúvidas registradas em `docs/decisoes.md`
- [ ] Todos os artefatos commitados e enviados ao Git
- [ ] Pull Request aberto (`develop` → `main`) com revisão solicitada a `@profesestito`
- [ ] Cada integrante consegue explicar as decisões principais
