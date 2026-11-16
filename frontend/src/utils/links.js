import { ENTRY_PARAM } from '@/constants/entries.js'
import { FAMILY_PARAM } from '@/constants/families.js'
import { REQUEST_PARAM } from '@/constants/requestActions.js'
import { ROUTES } from '@/constants/routes.js'

export const buildEntryLink = (id) => `${ROUTES.ENTRIES}?${ENTRY_PARAM}=${id}`

export const buildRequestLink = (id) => `${ROUTES.REQUESTS}?${REQUEST_PARAM}=${id}`

export const buildFamilyLink = (id) => `${ROUTES.FAMILIES}?${FAMILY_PARAM}=${id}`
