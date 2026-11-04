import { useCallback, useMemo, useState } from 'react'
import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { useFetch } from '@/hooks/useFetch.js'
import { listBeneficiaries } from '@/services/beneficiaryService.js'

const EMPTY_ROWS = []

const matchesSearch = (family, term) => family.responsibleName.toLowerCase().includes(term)

export const useFamilies = () => {
    const [status, setStatus] = useState(RECORD_STATUS.ACTIVE)
    const [search, setSearch] = useState('')

    const loadFamilies = useCallback(() => listBeneficiaries({ status }), [status])
    const { data, error, isLoading, reload } = useFetch(loadFamilies)
    const rows = data?.content ?? EMPTY_ROWS

    const families = useMemo(() => {
        const term = search.trim().toLowerCase()
        return term ? rows.filter((family) => matchesSearch(family, term)) : rows
    }, [rows, search])

    const handleSearchChange = (event) => {
        setSearch(event.target.value)
    }

    const changeStatus = (value) => {
        setStatus(value)
    }

    return {
        families,
        status,
        search,
        error,
        isLoading: isLoading && !data,
        reload,
        handleSearchChange,
        changeStatus,
    }
}
