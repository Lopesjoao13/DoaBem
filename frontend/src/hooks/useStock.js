import { useCallback, useMemo, useState } from 'react'
import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { ALL_FILTER } from '@/constants/stockFilters.js'
import { useFetch } from '@/hooks/useFetch.js'
import { getStock } from '@/services/stockService.js'

const EMPTY_ROWS = []

const matchesSearch = (row, search) => row.name.toLowerCase().includes(search.trim().toLowerCase())

const matchesCategory = (row, categoryId) =>
    categoryId === ALL_FILTER || String(row.categoryId) === categoryId

const countByLevel = (rows) =>
    rows.reduce((counts, row) => ({ ...counts, [row.level]: (counts[row.level] ?? 0) + 1 }), {
        [ALL_FILTER]: rows.length,
    })

const listCategories = (rows) =>
    [...new Map(rows.map((row) => [row.categoryId, row.categoryName]))]
        .map(([id, name]) => ({ value: String(id), label: name }))
        .sort((first, second) => first.label.localeCompare(second.label))

export const useStock = () => {
    const [status, setStatus] = useState(RECORD_STATUS.ACTIVE)
    const [search, setSearch] = useState('')
    const [categoryId, setCategoryId] = useState(ALL_FILTER)
    const [level, setLevel] = useState(ALL_FILTER)

    const loadStock = useCallback(() => getStock({ status }), [status])
    const { data, error, isLoading, reload } = useFetch(loadStock)
    const rows = data ?? EMPTY_ROWS

    const searchedRows = useMemo(
        () => rows.filter((row) => matchesSearch(row, search) && matchesCategory(row, categoryId)),
        [rows, search, categoryId],
    )

    const visibleRows = useMemo(
        () => searchedRows.filter((row) => level === ALL_FILTER || row.level === level),
        [searchedRows, level],
    )

    const levelCounts = useMemo(() => countByLevel(searchedRows), [searchedRows])
    const categories = useMemo(() => listCategories(rows), [rows])

    const handleSearchChange = (event) => {
        setSearch(event.target.value)
    }

    const handleCategoryChange = (event) => {
        setCategoryId(event.target.value)
    }

    const changeLevel = (value) => {
        setLevel(value)
    }

    const changeStatus = (value) => {
        setStatus(value)
    }

    return {
        rows: visibleRows,
        categories,
        levelCounts,
        status,
        search,
        categoryId,
        level,
        error,
        isLoading,
        reload,
        handleSearchChange,
        handleCategoryChange,
        changeLevel,
        changeStatus,
    }
}
