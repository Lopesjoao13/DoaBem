export const DEFAULT_PERIOD_PRESET = '30'

export const CUSTOM_PERIOD = 'custom'

export const PERIOD_PRESETS = [
    { value: '7', label: '7 dias' },
    { value: '30', label: '30 dias' },
    { value: '90', label: '90 dias' },
    { value: CUSTOM_PERIOD, label: 'Personalizado' },
]

export const CHART_Y_TICKS = 4

export const MONTHLY_SERIES = [
    { key: 'entries', label: 'Entradas', color: 'var(--teal-400)' },
    { key: 'deliveries', label: 'Entregas', color: 'var(--blue-500)' },
]

export const CATEGORY_COLORS = [
    'var(--teal-400)',
    'var(--amber-400)',
    'var(--blue-500)',
    'var(--purple-500)',
    'var(--green-400)',
    'var(--red-500)',
]

export const STOCK_LEVEL_PARAM = 'levels'
