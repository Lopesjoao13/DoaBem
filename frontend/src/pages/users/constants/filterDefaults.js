import { ALL_FILTER } from '@/constants/stockFilters.js'
import { isOneOf } from '@/utils/validators.js'
import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { ROLES } from '@/constants/roles.js'

export const USERS_DEFAULT_FILTERS = { search: '', role: ALL_FILTER, status: ALL_FILTER }

export const USERS_FILTER_VALIDATORS = {
    role: isOneOf([ALL_FILTER, ...Object.values(ROLES)]),
    status: isOneOf([ALL_FILTER, ...Object.values(RECORD_STATUS)]),
}
