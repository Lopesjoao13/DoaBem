import { ALL_FILTER } from '@/constants/stockFilters.js'
import { isEmptyOr, isId, isIsoDate } from '@/utils/validators.js'

export const ENTRIES_DEFAULT_FILTERS = {
    search: '',
    from: '',
    to: '',
    registeredBy: ALL_FILTER,
    itemId: ALL_FILTER,
}

export const ENTRIES_FILTER_VALIDATORS = {
    from: isEmptyOr(isIsoDate),
    to: isEmptyOr(isIsoDate),
    itemId: (value) => value === ALL_FILTER || isId(value),
}
