import { useMemo } from 'react'
import { ALL_FILTER } from '@/constants/stockFilters.js'
import { useFetch } from '@/hooks/useFetch.js'
import { useFilterParams } from '@/hooks/useFilterParams.js'
import { listEntries } from '@/services/entryService.js'
import { describeEntrySource } from '@/utils/entries.js'
import { EMPTY_ROWS } from '@/constants/emptyValues.js'
import {
    ENTRIES_DEFAULT_FILTERS,
    ENTRIES_FILTER_VALIDATORS,
} from '@/pages/entries/constants/filterDefaults.js'

const normalize = (text) => text.trim().toLowerCase()

const matchesSearch = (entry, search) =>
    `${entry.id} ${describeEntrySource(entry)}`.toLowerCase().includes(normalize(search))

const matchesPeriod = (entry, { from, to }) =>
    (!from || entry.entryDate >= from) && (!to || entry.entryDate <= to)

const matchesRegisteredBy = (entry, registeredBy) =>
    registeredBy === ALL_FILTER || entry.registeredBy === registeredBy

const matchesItem = (entry, itemId) =>
    itemId === ALL_FILTER || entry.receivedItems.some((item) => item.itemId === itemId)

const listReceivedItems = (entries) =>
    [
        ...new Map(
            entries.flatMap((entry) =>
                entry.receivedItems.map((item) => [item.itemId, item.itemName]),
            ),
        ),
    ]
        .map(([value, label]) => ({ value, label }))
        .sort((first, second) => first.label.localeCompare(second.label))

const listRegisteredBy = (entries) =>
    [...new Set(entries.map((entry) => entry.registeredBy))]
        .sort((first, second) => first.localeCompare(second))
        .map((name) => ({ value: name, label: name }))

export const useEntries = () => {
    const { data, error, isLoading, reload } = useFetch(listEntries)
    const { filters, setFilters, clearFilters, isFiltered } = useFilterParams(
        ENTRIES_DEFAULT_FILTERS,
        ENTRIES_FILTER_VALIDATORS,
    )
    const entries = data?.content ?? EMPTY_ROWS

    const visibleEntries = useMemo(
        () =>
            entries.filter(
                (entry) =>
                    matchesSearch(entry, filters.search) &&
                    matchesPeriod(entry, filters) &&
                    matchesRegisteredBy(entry, filters.registeredBy) &&
                    matchesItem(entry, filters.itemId),
            ),
        [entries, filters],
    )
    const registeredByOptions = useMemo(() => listRegisteredBy(entries), [entries])
    const itemOptions = useMemo(() => listReceivedItems(entries), [entries])

    const handleFilterChange = (event) => {
        const { name, value } = event.target
        setFilters({ [name]: value })
    }

    return {
        entries: visibleEntries,
        registeredByOptions,
        itemOptions,
        filters,
        isFiltered,
        error,
        isLoading,
        reload,
        handleFilterChange,
        clearFilters,
    }
}
