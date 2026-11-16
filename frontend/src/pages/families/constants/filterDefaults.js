import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { isOneOf } from '@/utils/validators.js'

export const FAMILIES_DEFAULT_FILTERS = { status: RECORD_STATUS.ACTIVE, search: '' }

export const FAMILIES_FILTER_VALIDATORS = { status: isOneOf(Object.values(RECORD_STATUS)) }
