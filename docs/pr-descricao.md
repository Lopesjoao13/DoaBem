# [SPRINT 01] P05 - Estruturação e modelagem inicial

Destino: `develop` → `main` | Revisor solicitado: @profesestito

## Resumo

A equipe estruturou a base do DoaBem: repositório e estratégia de branches, requisitos consolidados com as respostas do PO, stack e arquitetura, fluxo de telas com protótipo e DER, tudo confrontado com as regras de negócio e com os cenários de aceite.

## Stack escolhida e justificativa

- Java 21 + Spring Boot 3.x, Spring Data JPA e Spring Security (exigência do briefing).
- Banco: (preencher; proposta PostgreSQL pelo suporte a CHECK, transações e lock de linha).
- Build: (preencher; proposta Maven).
- Frontend: (preencher).
- Autenticação: (preencher; proposta JWT, ver `docs/arquitetura.md`).

## Artefatos

- Requisitos: `docs/requisitos.md` (38 RF, 29 RN, 10 RNF, 11 critérios de aceite)
- Mockups e fluxo de telas: `docs/mockups/`
- DER (Mermaid): `docs/der/der.md`
- Arquitetura: `docs/arquitetura.md`
- Decisões e dúvidas: `docs/decisoes.md`

## Principais decisões

- Monólito modular em camadas (Controller → Service → Repository).
- Saldo derivado de movimentações (ENTRY, RESERVE, RELEASE, DELIVERY, ADJUSTMENT, REVERSAL); sem coluna de saldo.
- Aprovação não reserva; reserva atômica na separação; entrega sem parcial.
- Movimentações imutáveis; correção por estorno vinculado, só pelo Coordenador.
- Regras críticas no service e por constraints no banco, com lock do item contra saldo negativo.

## Dúvidas para validação do professor (PO/Tech Lead)

D-01 a D-11 em `docs/decisoes.md`. As principais:
1. O saldo crítico compara o físico ou o disponível? (D-01)
2. Estorno de entrega com itens não devolvidos: qual tratamento? (D-02)
3. Quem pode cancelar solicitação em cada estado? (D-04)
4. Operador pode cadastrar itens e categorias? (D-05)

## Checklist de aceite

Ver `docs/checklist-aceite.md` (copiar a versão preenchida aqui antes de abrir o PR).

## Contribuições

| Integrante | Contribuição nesta sprint |
|---|---|
| João Miguel Zazula Lopes | (preencher) |
| Gabriel Hardt | (preencher) |
| Eduardo Angeli | (preencher) |
| Kaue Dylon Pereira Bruch | (preencher) |
| Vitor Viebranz Domingos | (preencher) |
