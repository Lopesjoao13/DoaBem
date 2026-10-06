# DoaBem

Sistema de Gestão de Doações e Distribuição de Recursos — Fábrica de Software P05 (UNIVILLE, Engenharia de Software, 2º bimestre 2026).

## Objetivo

Sistema web para registrar doações materiais, controlar estoque por categoria e organizar a distribuição dos recursos a beneficiários de forma rastreável. O saldo de estoque é sempre derivado das movimentações, nunca digitado.

## Integrantes

| Integrante | Responsabilidade primária |
|---|---|
| João Miguel Zazula Lopes | Coordenação / Requisitos + Backend |
| Gabriel Hardt | Frontend / UX |
| Eduardo Angeli | Dados + Backend |
| Kaue Dylon Pereira Bruch | Backend / Security |
| Vitor Viebranz Domingos | QA / DevOps / Documentação |

Cliente, Product Owner e Tech Lead acadêmico: Prof. Sestito (@profesestito).

## Stack (proposta, a confirmar pelo grupo)

| Camada | Tecnologia |
|---|---|
| Backend | Java 21 + Spring Boot 3.x (obrigatório) |
| Persistência | Spring Data JPA / Hibernate |
| Banco | PostgreSQL (proposta; ver `docs/arquitetura.md`) |
| Segurança | Spring Security |
| Validação | Jakarta Bean Validation |
| API | REST/JSON, documentada com OpenAPI/Swagger |
| Frontend | A definir (ver `docs/arquitetura.md`) |
| Testes | JUnit 5 + Mockito |

Arquitetura: monólito modular em camadas (Frontend → API REST → Controllers → Services → Repositories → Banco).

## Estrutura do repositório

```
doabem/
├── .github/pull_request_template.md
├── .gitignore
├── README.md
├── backend/                       Java 21 + Spring Boot (Sprint 02)
├── frontend/                      interface web (Sprint 02)
└── docs/
    ├── requisitos.md              requisitos, regras, critérios de aceite
    ├── arquitetura.md             contexto, camadas, stack e decisões técnicas (Mermaid)
    ├── decisoes.md                decisões do PO, técnicas e dúvidas
    ├── checklist-aceite.md        Definition of Done da Sprint 01
    ├── pr-descricao.md            texto do Pull Request da sprint
    ├── der/der.md                 DER em Mermaid, dicionário e restrições
    └── mockups/
        ├── fluxo-telas.md         navegação (Mermaid) e identidade visual
        ├── prototipo.md           capturas reais do protótipo e guia de identidade visual
        ├── img/                   imagens das capturas
        └── revisao-prototipo.md   revisão do protótipo (Figma/Lovable) contra os requisitos
```

## Como navegar pela documentação

- `docs/requisitos.md`: requisitos funcionais, regras de negócio, requisitos não funcionais, critérios de aceite e dúvidas.
- `docs/arquitetura.md`: stack, visão da arquitetura e justificativas.
- `docs/decisoes.md`: decisões tomadas, dúvidas resolvidas e pendências para o PO/Tech Lead.
- `docs/mockups/`: fluxo de telas e mockups de baixa fidelidade.
- `docs/der/der.md`: DER em Mermaid, dicionário de dados, cardinalidades e restrições.
- `docs/checklist-aceite.md`: Definition of Done da Sprint 01.

## Fluxo de trabalho Git

- `main`: versão estável/revisada. Sem commits diretos após a configuração inicial.
- `develop`: integração do trabalho da equipe.
- `feature/<descricao>`: entregas específicas (ex.: `feature/der-inicial`).
- Todo Pull Request exige revisão de pelo menos outro integrante.

## Como executar

A preencher na Sprint 02, quando houver código executável.
