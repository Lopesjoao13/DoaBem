import { isEmptyOr, isId, isIsoDate, isOneOf } from '@/utils/validators.js'
import { LISTED_MOVEMENT_TYPES } from '@/constants/movementTypes.js'
export const MOVEMENTS_DEFAULT_FILTERS = { from: '', to: '', itemId: '', type: '', userId: '' }

export const MOVEMENTS_FILTER_VALIDATORS = {
    from: isEmptyOr(isIsoDate),
    to: isEmptyOr(isIsoDate),
    itemId: isEmptyOr(isId),
    userId: isEmptyOr(isId),
    type: isEmptyOr(isOneOf(LISTED_MOVEMENT_TYPES)),
}
