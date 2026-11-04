import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFetch } from '@/hooks/useFetch.js'
import { listItems } from '@/services/catalogService.js'
import { listMovements } from '@/services/movementService.js'
import { listUserOptions } from '@/services/userService.js'

const EMPTY_PAGE = { content: [], page: 0, totalPages: 0, totalElements: 0 }
const EMPTY_ROWS = []

const toOptions = (rows, getLabel) =>
    rows.map((row) => ({ value: String(row.id), label: getLabel(row) }))

export const useMovements = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [filters, setFilters] = useState(() => ({
        from: '',
        to: '',
        itemId: searchParams.get('itemId') ?? '',
        type: '',
        userId: '',
    }))
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
        setFilters((current) => ({ ...current, [name]: value }))
        setPage(0)
    }

    const clearFilters = () => {
        setFilters({ from: '', to: '', itemId: '', type: '', userId: '' })
        setPage(0)
    }

    const changePage = (value) => {
        setPage(value)
    }

    const selectedMovementId = searchParams.get('movementId')

    const openMovement = (movementId) => {
        setSearchParams((current) => {
            const next = new URLSearchParams(current)
            next.set('movementId', movementId)
            return next
        })
    }

    const closeMovement = () => {
        setSearchParams((current) => {
            const next = new URLSearchParams(current)
            next.delete('movementId')
            return next
        })
    }

    return {
        page: movements.data ?? EMPTY_PAGE,
        filters,
        itemOptions,
        userOptions,
        error: movements.error,
        isLoading: movements.isLoading && !movements.data,
        reload: movements.reload,
        selectedMovementId,
        handleFilterChange,
        clearFilters,
        changePage,
        openMovement,
        closeMovement,
    }
}
