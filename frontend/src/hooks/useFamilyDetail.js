import { useCallback } from 'react'
import { useFetch } from '@/hooks/useFetch.js'
import { getBeneficiary } from '@/services/beneficiaryService.js'

export const useFamilyDetail = (id) => {
    const loadFamily = useCallback(() => getBeneficiary(id), [id])
    const { data, error, reload } = useFetch(loadFamily)
    return { family: data, error, reload }
}
