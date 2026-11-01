import { useMemo } from 'react'
import { useFetch } from '@/hooks/useFetch.js'
import { useFilterParams } from '@/hooks/useFilterParams.js'
import { ALL_FILTER } from '@/constants/stockFilters.js'
import { listUsers } from '@/services/userService.js'
import { matchesText } from '@/utils/search.js'
import { EMPTY_ROWS } from '@/constants/emptyValues.js'
import {
    USERS_DEFAULT_FILTERS,
    USERS_FILTER_VALIDATORS,
} from '@/pages/users/constants/filterDefaults.js'

const matchesStatus = (user, status) =>
    status === ALL_FILTER || (status === 'ACTIVE' ? user.active : !user.active)

export const useUsers = () => {
    const { data, error, isLoading, reload } = useFetch(listUsers)
    const { filters, setFilters, clearFilters, isFiltered } = useFilterParams(
        USERS_DEFAULT_FILTERS,
        USERS_FILTER_VALIDATORS,
    )
    const rows = data?.content ?? EMPTY_ROWS

    const users = useMemo(
        () =>
            rows.filter(
                (user) =>
                    (!filters.search.trim() ||
                        matchesText([user.name, user.email], filters.search)) &&
                    (filters.role === ALL_FILTER || user.role === filters.role) &&
                    matchesStatus(user, filters.status),
            ),
        [rows, filters],
    )

    const handleFilterChange = (event) => {
        const { name, value } = event.target
        setFilters({ [name]: value })
    }

    return {
        users,
        filters,
        isFiltered,
        error,
        isLoading: isLoading && !data,
        reload,
        handleFilterChange,
        clearFilters,
    }
}
