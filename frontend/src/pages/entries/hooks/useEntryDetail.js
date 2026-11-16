import { useCallback } from 'react'
import { useFetch } from '@/hooks/useFetch.js'
import { getEntry } from '@/services/entryService.js'

export const useEntryDetail = (id) => {
    const loadEntry = useCallback(() => getEntry(id), [id])
    const { data, error, isLoading, reload } = useFetch(loadEntry)
    return { entry: data, error, isLoading, reload }
}
