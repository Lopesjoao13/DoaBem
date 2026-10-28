import { TONES } from './tones.js'

export const REQUEST_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    PICKED: 'PICKED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
}

export const REQUEST_STATUS_LABELS = {
    [REQUEST_STATUS.PENDING]: 'Pendente',
    [REQUEST_STATUS.APPROVED]: 'Aprovada',
    [REQUEST_STATUS.REJECTED]: 'Recusada',
    [REQUEST_STATUS.PICKED]: 'Separada',
    [REQUEST_STATUS.DELIVERED]: 'Entregue',
    [REQUEST_STATUS.CANCELLED]: 'Cancelada',
}

export const REQUEST_STATUS_TONES = {
    [REQUEST_STATUS.PENDING]: TONES.WARNING,
    [REQUEST_STATUS.APPROVED]: TONES.INFO,
    [REQUEST_STATUS.REJECTED]: TONES.CRITICAL,
    [REQUEST_STATUS.PICKED]: TONES.INFO,
    [REQUEST_STATUS.DELIVERED]: TONES.SUCCESS,
    [REQUEST_STATUS.CANCELLED]: TONES.NEUTRAL,
}

export const ALL_REQUESTS_TAB = 'ALL'

export const REQUEST_TABS = [
    { value: REQUEST_STATUS.PENDING, label: 'Pendentes' },
    { value: REQUEST_STATUS.APPROVED, label: 'Aprovadas' },
    { value: REQUEST_STATUS.PICKED, label: 'Separadas' },
    { value: REQUEST_STATUS.DELIVERED, label: 'Entregues' },
    { value: REQUEST_STATUS.REJECTED, label: 'Recusadas' },
    { value: REQUEST_STATUS.CANCELLED, label: 'Canceladas' },
    { value: ALL_REQUESTS_TAB, label: 'Todas' },
]
