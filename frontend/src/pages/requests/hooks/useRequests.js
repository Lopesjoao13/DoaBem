import { useCallback, useMemo } from 'react'
import { ALL_REQUESTS_TAB } from '@/constants/requestStatus.js'
import { ALL_FILTER } from '@/constants/stockFilters.js'
import { useFetch } from '@/hooks/useFetch.js'
import { useFilterParams } from '@/hooks/useFilterParams.js'
import { listRequests } from '@/services/requestService.js'
import { EMPTY_ROWS, EMPTY_COUNTS } from '@/constants/emptyValues.js'
import {
    REQUESTS_DEFAULT_FILTERS,
    REQUESTS_FILTER_VALIDATORS,
} from '@/pages/requests/constants/filterDefaults.js'
import { DATE_LENGTH } from '@/constants/dates.js'

const matchesSearch = (request, search) =>
    `${request.id} ${request.beneficiaryName}`.toLowerCase().includes(search.trim().toLowerCase())

const matchesPeriod = (request, { from, to }) => {
    const date = request.createdAt.slice(0, DATE_LENGTH)
    return (!from || date >= from) && (!to || date <= to)
}

const matchesRequestedBy = (request, requestedBy) =>
    requestedBy === ALL_FILTER || request.requestedBy === requestedBy

const listRequestedBy = (requests) =>
    [...new Set(requests.map((request) => request.requestedBy))]
        .sort((first, second) => first.localeCompare(second))
        .map((name) => ({ value: name, label: name }))

export const useRequests = () => {
    const { filters, setFilters, clearFilters, isFiltered } = useFilterParams(
        REQUESTS_DEFAULT_FILTERS,
        REQUESTS_FILTER_VALIDATORS,
    )
    const { tab } = filters

    const loadRequests = useCallback(
        () => listRequests({ status: tab === ALL_REQUESTS_TAB ? undefined : tab }),
        [tab],
    )
    const { data, error, isLoading, reload } = useFetch(loadRequests)
    const requests = data?.content ?? EMPTY_ROWS

    const visibleRequests = useMemo(
        () =>
            requests.filter(
                (request) =>
                    matchesSearch(request, filters.search) &&
                    matchesPeriod(request, filters) &&
                    matchesRequestedBy(request, filters.requestedBy),
            ),
        [requests, filters],
    )
    const requestedByOptions = useMemo(() => listRequestedBy(requests), [requests])

    const changeTab = (value) => setFilters({ tab: value })

    const handleFilterChange = (event) => {
        const { name, value } = event.target
        setFilters({ [name]: value })
    }

    return {
        requests: visibleRequests,
        requestedByOptions,
        counts: data?.counts ?? EMPTY_COUNTS,
        tab,
        filters,
        isFiltered,
        error,
        isLoading,
        reload,
        changeTab,
        handleFilterChange,
        clearFilters,
    }
}
