import { RECORD_STATUS, RECORD_STATUS_LABELS } from '@/constants/recordStatus.js'
import { ROLE_LABELS, ROLES } from '@/constants/roles.js'
import { ALL_FILTER } from '@/constants/stockFilters.js'

export const ROLE_OPTIONS = Object.values(ROLES).map((role) => ({
    value: role,
    label: ROLE_LABELS[role],
}))

export const STATUS_OPTIONS = Object.values(RECORD_STATUS).map((value) => ({
    value,
    label: RECORD_STATUS_LABELS[value],
}))

export const SELECT_ROLE = { value: '', label: 'Selecione o perfil' }
export const ALL_ROLES = { value: ALL_FILTER, label: 'Todos os perfis' }
export const ALL_STATUS = { value: ALL_FILTER, label: 'Todas as situações' }
