import { useCallback } from 'react'
import { useFetch } from '@/hooks/useFetch.js'
import { getFamilyHistory } from '@/services/requestService.js'

export const useFamilyHistory = (familyId) => {
    const loadHistory = useCallback(() => getFamilyHistory(familyId), [familyId])
    const { data, error, reload } = useFetch(loadHistory)
    return { history: data, error, reload }
}
