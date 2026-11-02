import { useCallback, useState } from 'react'
import { CUSTOM_PERIOD, DEFAULT_PERIOD_PRESET } from '@/pages/dashboard/constants/dashboard.js'
import { useFetch } from '@/hooks/useFetch.js'
import { getDashboard } from '@/services/dashboardService.js'
import { getLastDaysRange } from '@/utils/dateRange.js'

export const useDashboard = () => {
    const [preset, setPreset] = useState(DEFAULT_PERIOD_PRESET)
    const [period, setPeriod] = useState(() => getLastDaysRange(Number(DEFAULT_PERIOD_PRESET)))

    const loadDashboard = useCallback(() => getDashboard(period), [period])
    const { data, error, isLoading, reload } = useFetch(loadDashboard)

    const selectPreset = (value) => {
        setPreset(value)
        if (value !== CUSTOM_PERIOD) setPeriod(getLastDaysRange(Number(value)))
    }

    const handleFromChange = (event) => {
        setPeriod((current) => ({ ...current, from: event.target.value }))
    }

    const handleToChange = (event) => {
        setPeriod((current) => ({ ...current, to: event.target.value }))
    }

    return {
        summary: data,
        period,
        preset,
        error,
        isLoading,
        reload,
        selectPreset,
        handleFromChange,
        handleToChange,
    }
}
