import { useFetch } from '@/hooks/useFetch.js'
import { listEntries } from '@/services/entryService.js'

const EMPTY_ROWS = []

export const useEntries = () => {
    const { data, error, isLoading, reload } = useFetch(listEntries)
    return { entries: data?.content ?? EMPTY_ROWS, error, isLoading, reload }
}
