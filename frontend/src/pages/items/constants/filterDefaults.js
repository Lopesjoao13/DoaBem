import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { ALL_FILTER } from '@/constants/stockFilters.js'
import { CATALOG_TABS } from './catalogTabs.js'
import { isId, isOneOf } from '@/utils/validators.js'

export const CATALOG_DEFAULT_FILTERS = {
    tab: CATALOG_TABS.ITEMS,
    itemStatus: RECORD_STATUS.ACTIVE,
    itemSearch: '',
    itemCategoryId: ALL_FILTER,
}

export const CATALOG_ITEM_FILTER_KEYS = ['itemStatus', 'itemSearch', 'itemCategoryId']

export const CATALOG_FILTER_VALIDATORS = {
    tab: isOneOf(Object.values(CATALOG_TABS)),
    itemStatus: isOneOf(Object.values(RECORD_STATUS)),
    itemCategoryId: (value) => value === ALL_FILTER || isId(value),
}
