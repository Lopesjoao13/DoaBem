import { RECORD_STATUS } from './recordStatus.js'
import { STOCK_LEVELS, STOCK_LEVEL_LABELS } from './stockLevels.js'

export const ALL_FILTER = 'ALL'

export const ALL_LEVELS = [STOCK_LEVELS.CRITICAL, STOCK_LEVELS.LOW, STOCK_LEVELS.NORMAL]

export const LEVEL_FILTER_OPTIONS = ALL_LEVELS.map((level) => ({
    value: level,
    label: STOCK_LEVEL_LABELS[level],
}))

export const STATUS_FILTER_OPTIONS = [
    { value: RECORD_STATUS.ACTIVE, label: 'Ativos' },
    { value: RECORD_STATUS.INACTIVE, label: 'Inativos' },
]
