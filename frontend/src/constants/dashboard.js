export const DEFAULT_PERIOD_DAYS = 30

export const CARD_SCOPES = {
    CURRENT: 'Saldo atual',
    PERIOD: 'No período',
}

export const CHART_Y_TICKS = 4

export const MONTHLY_SERIES = [
    { key: 'entries', label: 'Entradas', color: 'var(--color-chart-entries)' },
    { key: 'deliveries', label: 'Entregas', color: 'var(--color-chart-deliveries)' },
]

export const LEVEL_SERIES = [
    { key: 'critical', label: 'Crítico', color: 'var(--color-critical)' },
    { key: 'low', label: 'Baixo', color: 'var(--color-accent)' },
    { key: 'normal', label: 'Normal', color: 'var(--color-success)' },
]
