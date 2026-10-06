# Registro de Decisões e Dúvidas — DoaBem

Atualizado em 06/10/2026, após as respostas do PO (entrevista de 05/10/2026). O detalhamento completo está em `docs/requisitos.md`.

## 1. Decisões de negócio (respondidas pelo PO)

| ID | Tema | Decisão do PO | Impacto |
|---|---|---|---|
| Q01 | Unidade ou peso | Ambos; unidade base obrigatória por item; sem estoque financeiro | `item.unit_of_measure`, `NUMERIC(12,3)` |
| Q02 | Conversão | UN, KG e L; sem conversão automática; UN só inteiros, KG/L até 3 casas | Validação de escala no service/API |
| Q03 | Validade | Opcional e informativa na entrada; sem lote nem alertas | `donation_entry_item.expiry_date` |
| Q04 | Saldo crítico | Saldo ≤ estoque mínimo (padrão 0, editável); não usar só cor | Rótulo textual "Crítico" |
| Q05 | Saídas sem entrega | Ajuste (perda, avaria, vencimento, transferência) só pelo Coordenador, com motivo | Tipo `ADJUSTMENT` em `stock_movement` |
| Q06 | Desativar item | ATIVO/INATIVO; bloqueia com reserva ativa; histórico preservado | `item.status` |
| Q07 | Quem abre solicitação | Operador e Coordenador, para famílias ativas | Matriz de permissões |
| Q08 | Aprovação | Total, parcial ou recusa; justificativa em corte/recusa | `aid_request_item.approved_qty`, `aid_request.justification` |
| Q09 | Estados | PENDENTE → APROVADA/RECUSADA; APROVADA → SEPARADA → ENTREGUE; cancelamento com motivo; a reserva é feita na separação; sem expiração | `solicitacao.status` e campos de separação/cancelamento |
| Q10 | Entrega parcial | Não há após a separação; correção por cancelamento ou estorno | `entrega` 1:0..1 com a solicitação |
| Q11 | Limite por família | Sem limite rígido; mostrar última entrega e últimos 30 dias | Apoio à decisão do Coordenador |
| Q12 | Comprovante | Registro digital da entrega; sem PDF/assinatura | Tela de detalhe da entrega |
| Q13 | Estorno | Só Coordenador, com justificativa e vínculo; sem estorno duplo; regras para entrada e entrega | `stock_movement.reverses_id` UNIQUE |
| Q14 | Doador | Texto livre opcional; "anônimo"; sem CPF/CNPJ | `donation_entry.source`, `anonymous` |
| Q15 | Entrada multi-item | Sim, atômica (tudo ou nada) | `donation_entry_item` |
| Q16 | Dados da família | Nome do responsável, telefone, bairro, nº de integrantes e observações (opcionais); sem CPF, renda, endereço completo | `beneficiary` |
| Q17 | Pessoa ou família | Núcleo familiar identificado pelo responsável; sem dependentes | Termo "Família/beneficiário" |
| Q18 | Usuários | Coordenador gerencia usuários; sem perfil Administrador; Coordenador pré-configurado para demonstração | Tela de usuários |
| Q19 | Sessão ou token | Equipe decide e justifica; sem recuperação por e-mail; redefinição pelo Coordenador (se seguro) | Ver `arquitetura.md` |
| Q20 | Coordenador faz tudo | Sim, mais as ações privativas; API nega com 403 | Matriz de permissões |
| Q21 | Dashboard | 6 indicadores; período padrão 30 dias só para entradas/entregas; sem exportação obrigatória | Cartões "atual" × "no período" |
| Q22 | Histórico | Filtros por período, item e tipo (entrada, saída por entrega, ajuste, estorno); usuário desejável | Tela de movimentações |

## 2. Decisões técnicas (a fechar pelo grupo)

| ID | Tema | Opções | Recomendação | Status |
|---|---|---|---|---|
| T01 | Java e framework | Java 21 + Spring Boot 3.x | Exigido pelo briefing | Fechado |
| T02 | Arquitetura | Monólito modular em camadas | Exigido pelo briefing | Fechado |
| T03 | Build | Maven ou Gradle | Maven | A confirmar |
| T04 | Banco | PostgreSQL ou MySQL | PostgreSQL (CHECK, transações, `FOR UPDATE`) | A confirmar |
| T05 | Autenticação | Sessão ou token | JWT com Spring Security, com tempo de expiração curto | A confirmar |
| T06 | Frontend | JS puro, React, Vue, Angular | A decidir pelo grupo (ver `arquitetura.md`) | A confirmar |
| T07 | Migração/semente | Flyway ou Liquibase | Flyway, com massa de demonstração | A confirmar |
| T08 | Protótipo | Figma ou Lovable | Lovable para o protótipo e Figma para o guia visual; capturas em `docs/mockups` | Em andamento |

## 3. Dúvidas remanescentes para o PO

| ID | Pergunta | Proposta da equipe | Status |
|---|---|---|---|
| D-01 | O saldo comparado ao mínimo é físico ou disponível? | Disponível | Pendente |
| D-02 | Estorno de entrega com itens não devolvidos: qual tratamento? | Sem movimentação de estoque; orientar ajuste | Pendente |
| D-03 | Ajustes e entradas podem ser estornados? Estorno de estorno? | Sim, exceto estorno de estorno | Pendente |
| D-04 | Quem cancela cada estado? | Coordenador cancela PENDENTE/APROVADA; ambos cancelam SEPARADA | Pendente |
| D-05 | Operador cadastra itens e categorias? | Só o Coordenador | Pendente |
| D-06 | Aprovar parcial com tudo zero equivale a recusa? | Sim | Pendente |
| D-07 | Inativar item com saldo: bloqueia ou avisa? | Avisar e bloquear até zerar o saldo disponível | Pendente |
| D-08 | Reservas/liberações aparecem na lista de movimentações? | Só no detalhe da solicitação | Pendente |
| D-09 | Quando inativar família e o que ocorre com solicitações abertas? | Bloquear com solicitação em andamento | Pendente |
| D-10 | "Cestas prontas" são item comum em UN? | Sim, sem composição | Pendente |
| D-11 | Redefinição de senha: ação do sistema ou procedimento? | Ação do Coordenador, com troca obrigatória, se houver tempo | Pendente |

## 4. Pontos de atenção técnicos

- **Concorrência:** duas separações ou ajustes simultâneos podem gerar saldo negativo; exige lock da linha do item e constraint, com teste.
- **Escala decimal:** `NUMERIC(12,3)` cobre KG/L; para UN a validação "inteiro" fica no service (e opcionalmente em trigger).
- **Atomicidade:** entrada, separação, entrega e cancelamento são transações únicas.
