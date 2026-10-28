import { RECORD_STATUS } from './recordStatus.js'
import { STOCK_LEVELS, STOCK_LEVEL_LABELS } from './stockLevels.js'

export const ALL_FILTER = 'ALL'

export const LEVEL_FILTER_OPTIONS = [
    { value: ALL_FILTER, label: 'Todos' },
    { value: STOCK_LEVELS.CRITICAL, label: STOCK_LEVEL_LABELS[STOCK_LEVELS.CRITICAL] },
    { value: STOCK_LEVELS.LOW, label: STOCK_LEVEL_LABELS[STOCK_LEVELS.LOW] },
    { value: STOCK_LEVELS.NORMAL, label: STOCK_LEVEL_LABELS[STOCK_LEVELS.NORMAL] },
]

export const STATUS_FILTER_OPTIONS = [
    { value: RECORD_STATUS.ACTIVE, label: 'Ativos' },
    { value: RECORD_STATUS.INACTIVE, label: 'Inativos' },
]
