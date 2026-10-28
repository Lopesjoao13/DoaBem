import { TONES } from './tones.js'

export const STOCK_LEVELS = {
    CRITICAL: 'CRITICAL',
    LOW: 'LOW',
    NORMAL: 'NORMAL',
}

export const STOCK_LEVEL_LABELS = {
    [STOCK_LEVELS.CRITICAL]: 'Crítico',
    [STOCK_LEVELS.LOW]: 'Baixo',
    [STOCK_LEVELS.NORMAL]: 'Normal',
}

export const STOCK_LEVEL_TONES = {
    [STOCK_LEVELS.CRITICAL]: TONES.CRITICAL,
    [STOCK_LEVELS.LOW]: TONES.WARNING,
    [STOCK_LEVELS.NORMAL]: TONES.SUCCESS,
}
