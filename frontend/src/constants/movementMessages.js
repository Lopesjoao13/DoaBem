import { MOVEMENT_TYPES } from './movementTypes.js'

export const MOVEMENT_MESSAGES = {
    reversed: 'Estorno registrado e vinculado ao lançamento original.',
    reverseNotice:
        'O original não é alterado. O estorno cria uma movimentação compensatória vinculada, com seu usuário e data/hora.',
    itemsReturnedLabel: 'Os itens retornaram à instituição',
    deliveryReverseHint:
        'O estorno de entrega devolve os itens ao estoque. Só confirme se eles voltaram fisicamente.',
    entryReverseHint: 'O estorno de entrada exige saldo disponível suficiente do item.',
}

export const REVERSIBLE_MOVEMENT_TYPES = [
    MOVEMENT_TYPES.ENTRY,
    MOVEMENT_TYPES.DELIVERY,
    MOVEMENT_TYPES.ADJUSTMENT,
]
