export const REQUEST_MESSAGES = {
    created: 'Solicitação criada como pendente. Nada foi reservado.',
    approved: 'Solicitação aprovada. A reserva acontece na separação.',
    rejected: 'Solicitação recusada.',
    picked: 'Itens separados e reservados.',
    delivered: 'Entrega confirmada. O estoque foi baixado.',
    cancelled: 'Solicitação cancelada.',
    createNotice: 'Criar a solicitação não reserva nem retira itens do estoque.',
    approveNotice: 'Confira o saldo disponível antes de aprovar. A aprovação não reserva itens.',
    awaitingDecision: 'Aguardando a análise do coordenador.',
    cutJustification: 'Informe a justificativa da aprovação parcial.',
    approvedAboveRequested: 'O aprovado não pode exceder o solicitado.',
    deliverNotice:
        'A entrega confirma todas as quantidades separadas. Não há entrega parcial: se a família recebeu menos, cancele a separação e crie outra solicitação.',
    pickNotice: 'A separação reserva as quantidades aprovadas. Se faltar saldo, nada é reservado.',
}
