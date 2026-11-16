import { ALL_FILTER } from '@/constants/stockFilters.js'
import { isEmptyOr, isIsoDate, isOneOf } from '@/utils/validators.js'
import { REQUEST_STATUS, REQUEST_TABS } from '@/constants/requestStatus.js'

export const REQUESTS_DEFAULT_FILTERS = {
    tab: REQUEST_STATUS.PENDING,
    search: '',
    from: '',
    to: '',
    requestedBy: ALL_FILTER,
}

export const REQUESTS_FILTER_VALIDATORS = {
    tab: isOneOf(REQUEST_TABS.map(({ value }) => value)),
    from: isEmptyOr(isIsoDate),
    to: isEmptyOr(isIsoDate),
}
