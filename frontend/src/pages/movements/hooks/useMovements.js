import { useCallback, useMemo, useState } from 'react'
import { LIST_ALL_PARAMS } from '@/constants/api.js'
import { useDetailParam } from '@/hooks/useDetailParam.js'
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

    const loadMovements = useCallback(() => listMovements({ ...filters, page }), [filters, page])
    const movements = useFetch(loadMovements)
    const items = useFetch(listItems)
    const users = useFetch(listUserOptions)

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

    const fetchAll = async () => (await listMovements({ ...filters, ...LIST_ALL_PARAMS })).content

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
