import { MOVEMENT_MESSAGES } from '@/pages/movements/constants/movementMessages.js'
import {
    LISTED_MOVEMENT_TYPES,
    MOVEMENT_TYPE_LABELS,
    MOVEMENT_TYPES,
} from '@/constants/movementTypes.js'

export const TYPE_OPTIONS = LISTED_MOVEMENT_TYPES.map((type) => ({
    value: type,
    label: MOVEMENT_TYPE_LABELS[type],
}))

export const ALL_ITEMS = { value: '', label: 'Todos os itens' }
export const ALL_TYPES = { value: '', label: 'Todos os tipos' }
export const ALL_USERS = { value: '', label: 'Todos os usuários' }

export const TYPE_HINTS = {
    [MOVEMENT_TYPES.ENTRY]: MOVEMENT_MESSAGES.entryReverseHint,
    [MOVEMENT_TYPES.DELIVERY]: MOVEMENT_MESSAGES.deliveryReverseHint,
}
