import { LEVEL_FILTER_OPTIONS } from '@/constants/stockFilters.js'

export const toLevelOptions = (levelCounts) =>
    LEVEL_FILTER_OPTIONS.map(({ value, label }) => ({
        value,
        label: `${label} (${levelCounts[value] ?? 0})`,
    }))
