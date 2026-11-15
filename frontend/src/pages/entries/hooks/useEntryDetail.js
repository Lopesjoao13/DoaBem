import { QUERY_KEYS } from '@/constants/queryKeys.js'
import { useFetch } from '@/hooks/useFetch.js'
import { getEntry } from '@/services/entryService.js'

export const useEntryDetail = (id) => {
    const { data, error, isLoading, reload } = useFetch([QUERY_KEYS.ENTRIES, id], () =>
        getEntry(id),
    )
    return { entry: data, error, isLoading, reload }
}
