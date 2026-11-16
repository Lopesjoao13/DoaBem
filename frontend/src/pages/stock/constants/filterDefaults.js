import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { ALL_FILTER, ALL_LEVELS } from '@/constants/stockFilters.js'
import { isId, isOneOf } from '@/utils/validators.js'

export const STOCK_DEFAULT_FILTERS = {
    status: RECORD_STATUS.ACTIVE,
    search: '',
    categoryId: ALL_FILTER,
    levels: ALL_LEVELS,
}

export const STOCK_FILTER_VALIDATORS = {
    status: isOneOf(Object.values(RECORD_STATUS)),
    categoryId: (value) => value === ALL_FILTER || isId(value),
}
