import { useCallback, useState } from 'react'
import { DEFAULT_PERIOD_DAYS } from '@/constants/dashboard.js'
import { useFetch } from '@/hooks/useFetch.js'
import { getDashboard } from '@/services/dashboardService.js'
import { getLastDaysRange } from '@/utils/dateRange.js'

export const useDashboard = () => {
    const [period, setPeriod] = useState(() => getLastDaysRange(DEFAULT_PERIOD_DAYS))

    const loadDashboard = useCallback(() => getDashboard(period), [period])
    const { data, error, isLoading, reload } = useFetch(loadDashboard)

    const handleFromChange = (event) => {
        setPeriod((current) => ({ ...current, from: event.target.value }))
    }

    const handleToChange = (event) => {
        setPeriod((current) => ({ ...current, to: event.target.value }))
    }

    const resetPeriod = () => {
        setPeriod(getLastDaysRange(DEFAULT_PERIOD_DAYS))
    }

    return {
        summary: data,
        period,
        error,
        isLoading,
        reload,
        handleFromChange,
        handleToChange,
        resetPeriod,
    }
}
