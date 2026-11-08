import { useCallback, useMemo } from 'react'
import { ALL_FILTER, ALL_LEVELS } from '@/constants/stockFilters.js'
import { useFetch } from '@/hooks/useFetch.js'
import { useFilterParams } from '@/hooks/useFilterParams.js'
import { getStock } from '@/services/stockService.js'
import { EMPTY_ROWS } from '@/constants/emptyValues.js'
import {
    STOCK_DEFAULT_FILTERS,
    STOCK_FILTER_VALIDATORS,
} from '@/pages/stock/constants/filterDefaults.js'

const matchesSearch = (row, search) => row.name.toLowerCase().includes(search.trim().toLowerCase())

const matchesCategory = (row, categoryId) =>
    categoryId === ALL_FILTER || String(row.categoryId) === categoryId

const countByLevel = (rows) =>
    rows.reduce((counts, row) => ({ ...counts, [row.level]: (counts[row.level] ?? 0) + 1 }), {})

const listCategories = (rows) =>
    [...new Map(rows.map((row) => [row.categoryId, row.categoryName]))]
        .map(([id, name]) => ({ value: String(id), label: name }))
        .sort((first, second) => first.label.localeCompare(second.label))

export const useStock = () => {
    const { filters, setFilters, clearFilters, isFiltered } = useFilterParams(
        STOCK_DEFAULT_FILTERS,
        STOCK_FILTER_VALIDATORS,
    )
    const { status, search, categoryId } = filters
    const levels = useMemo(
        () => filters.levels.filter((level) => ALL_LEVELS.includes(level)),
        [filters.levels],
    )

    const loadStock = useCallback(() => getStock({ status }), [status])
    const { data, error, isLoading, reload } = useFetch(loadStock)
    const rows = data ?? EMPTY_ROWS

    const searchedRows = useMemo(
        () => rows.filter((row) => matchesSearch(row, search) && matchesCategory(row, categoryId)),
        [rows, search, categoryId],
    )

    const visibleRows = useMemo(
        () => searchedRows.filter((row) => levels.includes(row.level)),
        [searchedRows, levels],
    )

    const levelCounts = useMemo(() => countByLevel(searchedRows), [searchedRows])
    const categories = useMemo(() => listCategories(rows), [rows])

    const handleSearchChange = (event) => setFilters({ search: event.target.value })

    const handleCategoryChange = (event) => setFilters({ categoryId: event.target.value })

    const changeLevels = (value) => setFilters({ levels: value })

    const changeStatus = (value) => setFilters({ status: value })

    return {
        rows: visibleRows,
        categories,
        levelCounts,
        status,
        search,
        categoryId,
        levels,
        error,
        isLoading,
        reload,
        handleSearchChange,
        handleCategoryChange,
        changeLevels,
        changeStatus,
        clearFilters,
        isFiltered,
    }
}
