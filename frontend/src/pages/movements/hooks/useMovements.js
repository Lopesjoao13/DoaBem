import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { LIST_ALL_PARAMS } from '@/constants/api.js'
import { useDetailParam } from '@/hooks/useDetailParam.js'
import { QUERY_KEYS, STALE_TIME } from '@/constants/queryKeys.js'
import { useFetch } from '@/hooks/useFetch.js'
import { useFilterParams } from '@/hooks/useFilterParams.js'
import { listItems } from '@/services/catalogService.js'
import { listMovements } from '@/services/movementService.js'
import { listUserOptions } from '@/services/userService.js'
import { EMPTY_PAGE, EMPTY_ROWS } from '@/constants/emptyValues.js'
import {
    MOVEMENTS_DEFAULT_FILTERS,
    MOVEMENTS_FILTER_VALIDATORS,
} from '@/pages/movements/constants/filterDefaults.js'

const toOptions = (rows, getLabel) =>
    rows.map((row) => ({ value: String(row.id), label: getLabel(row) }))

export const useMovements = () => {
    const {
        filters,
        setFilters,
        clearFilters: resetFilters,
        isFiltered,
    } = useFilterParams(MOVEMENTS_DEFAULT_FILTERS, MOVEMENTS_FILTER_VALIDATORS)
    const detail = useDetailParam('movementId')
    const [page, setPage] = useState(0)

    const movements = useFetch([QUERY_KEYS.MOVEMENTS, filters, page], () =>
        listMovements({ ...filters, page }),
    )
    const items = useFetch(QUERY_KEYS.ITEMS, () => listItems(), {
        staleTime: STALE_TIME.REFERENCE,
    })
    const users = useFetch(QUERY_KEYS.USER_OPTIONS, listUserOptions, {
        staleTime: STALE_TIME.REFERENCE,
    })

    const itemOptions = useMemo(
        () => toOptions(items.data?.content ?? EMPTY_ROWS, (item) => item.name),
        [items.data],
    )
    const userOptions = useMemo(
        () => toOptions(users.data ?? EMPTY_ROWS, (user) => user.name),
        [users.data],
    )

    const handleFilterChange = (event) => {
        const { name, value } = event.target
        setFilters({ [name]: value })
        setPage(0)
    }

    const clearFilters = () => {
        resetFilters()
        setPage(0)
    }

    const changePage = (value) => {
        setPage(value)
    }

    // Exportação sob demanda: a consulta só roda quando o botão chama refetch.
    const exportQuery = useQuery({
        queryKey: [QUERY_KEYS.MOVEMENTS, 'export', filters],
        queryFn: () => listMovements({ ...filters, ...LIST_ALL_PARAMS }),
        enabled: false,
    })
    const fetchAll = async () => (await exportQuery.refetch({ throwOnError: true })).data.content

    return {
        fetchAll,
        page: movements.data ?? EMPTY_PAGE,
        filters,
        isFiltered,
        itemOptions,
        userOptions,
        error: movements.error,
        isLoading: movements.isLoading && !movements.data,
        isRefreshing: movements.isLoading && Boolean(movements.data),
        reload: movements.reload,
        selectedMovementId: detail.id,
        handleFilterChange,
        clearFilters,
        changePage,
        openMovement: detail.open,
        closeMovement: detail.close,
    }
}
