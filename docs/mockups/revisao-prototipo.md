# Revisão do protótipo e ajustes planejados

Data: 06/10/2026. Base: telas do protótipo (Figma/Lovable) comparadas com as respostas do PO (Qxx) e com `docs/requisitos.md`. O protótipo foi gerado antes das respostas do PO; esta lista reúne os ajustes que ele precisa receber.

## 1. O que já está alinhado

- Menu lateral, topo escuro, busca (Ctrl K) e perfil visível.
- Estoque com físico, reservado e disponível, barra de nível e status em texto (Crítico, Baixo, Normal), sem depender só de cor (Q04, RNF01).
- Saldo somente leitura, com a regra "Disponível = Físico − Reservado" explicada na tela (RN03).
- Login só para uso interno, sem cadastro público.
- Itens com unidade (UN, KG, L), estoque mínimo e situação (Q01, Q02, Q06).
- Guia de identidade visual com marca, cores, tipografia (IBM Plex Sans), componentes e estados.

## 2. Ajustes a aplicar (conforme respostas do PO)

| # | Tela | Ajuste | Origem |
|---|---|---|---|
| 1 | Login | Trocar "Reservas: Na aprovação" por "Na separação": a aprovação não reserva | Q09, RN17 |
| 2 | Guia de componentes | Aviso "Pendente": trocar "antes de aprovar a reserva" por "Confira o saldo disponível antes de aprovar" | Q09, RN17 |
| 3 | Famílias | Remover o CPF da lista e do cadastro; o cadastro leva responsável, telefone e bairro opcionais, nº de integrantes e observações | Q16, RN25 |
| 4 | Login | Remover o link "Esqueci a senha" | Q19 |
| 5 | Solicitações | Abas com os estados reais: Pendente, Aprovada, Separada, Entregue, Recusada e Cancelada | Q09 |
| 6 | Dashboard | Filtro de datas (padrão últimos 30 dias) e rótulo "Saldo atual" ou "No período" em cada cartão | Q21, RF36 |
| 7 | Dashboard | Cartão próprio para solicitações pendentes e lista dos cinco itens mais críticos com saldo e mínimo | Q21, RF35 |
| 8 | Estoque | Ação "Registrar saída por ajuste" (Coordenador) e filtro Ativos/Inativos | Q05, Q06 |
| 9 | Entradas de doação | Detalhe da entrada e formulário com vários itens, validade opcional (informativa) e "Doação anônima" | Q03, Q14, Q15 |
| 10 | Famílias | Usar o termo "Famílias/beneficiários" nos cadastros e buscas | Q17 |
| 11 | Solicitações | Datas no formato dd/mm/aaaa | pt-BR |

## 3. Telas que ainda faltam no protótipo

Nova entrada (formulário), nova solicitação, análise do Coordenador (solicitado × aprovado e justificativa), separação e confirmação de entrega, detalhe da entrega, movimentações com estorno vinculado, saída por ajuste, formulário de itens com bloqueio de inativação e usuários. As capturas atuais estão em `prototipo.md`.

## 4. Prompt de ajuste para o Lovable

```text
Ajuste o protótipo DoaBem conforme as respostas do PO:
- Login: remover "Esqueci a senha"; no painel verde trocar "Reservas: Na aprovação" por "Na separação".
- Famílias: renomear de Beneficiários para "Famílias"; remover CPF; mostrar responsável, integrantes, telefone (opcional), bairro (opcional) e última entrega.
- Solicitações: abas Pendentes, Aprovadas, Separadas, Entregues, Recusadas e Canceladas; datas dd/mm/aaaa; detalhe com solicitado x aprovado, justificativa obrigatória em corte ou recusa, "Última entrega" e entregas dos últimos 30 dias; fluxo Aprovar -> Separar -> Entregar (aprovar não reserva; separar reserva; entrega sem edição de quantidades).
- Dashboard: filtro de datas (padrão últimos 30 dias); cartões rotulados "Saldo atual" ou "No período"; cartões de itens ativos, itens críticos, entradas, entregas concluídas e solicitações pendentes; top 5 itens críticos.
- Estoque: adicionar filtro Ativos/Inativos e a ação "Registrar saída por ajuste" (só Coordenador, com motivo: Perda, Avaria, Vencimento, Transferência).
- Movimentações: filtros por período, item, tipo (Entrada, Saída por entrega, Ajuste, Estorno); "Estornar" só para Coordenador, com justificativa e vínculo entre original e estorno.
- Entradas: detalhe da entrada; formulário com vários itens, validade opcional (informativa) e "Doação anônima".
- Usuários: tela só para o Coordenador (nome, e-mail, perfil, status).
- Aviso "Pendente": "Confira o saldo disponível antes de aprovar."
```
