import { useCallback, useMemo } from 'react'
import { useFetch } from '@/hooks/useFetch.js'
import { useFilterParams } from '@/hooks/useFilterParams.js'
import { listBeneficiaries } from '@/services/beneficiaryService.js'
import { matchesText } from '@/utils/search.js'
import { EMPTY_ROWS } from '@/constants/emptyValues.js'
import {
    FAMILIES_DEFAULT_FILTERS,
    FAMILIES_FILTER_VALIDATORS,
} from '@/pages/families/constants/filterDefaults.js'

const matchesSearch = (family, term) =>
    matchesText([family.responsibleName, family.phone, family.neighborhood], term)

export const useFamilies = () => {
    const { filters, setFilters, clearFilters, isFiltered } = useFilterParams(
        FAMILIES_DEFAULT_FILTERS,
        FAMILIES_FILTER_VALIDATORS,
    )
    const { status, search } = filters

    const loadFamilies = useCallback(() => listBeneficiaries({ status }), [status])
    const { data, error, isLoading, reload } = useFetch(loadFamilies)
    const rows = data?.content ?? EMPTY_ROWS

    const families = useMemo(
        () => (search.trim() ? rows.filter((family) => matchesSearch(family, search)) : rows),
        [rows, search],
    )

    const handleSearchChange = (event) => setFilters({ search: event.target.value })

    const changeStatus = (value) => setFilters({ status: value })

    return {
        families,
        status,
        search,
        isFiltered,
        error,
        isLoading: isLoading && !data,
        reload,
        handleSearchChange,
        changeStatus,
        clearFilters,
    }
}
