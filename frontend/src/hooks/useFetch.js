import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { API_MESSAGES } from '@/constants/apiMessages.js'

export const useFetch = (queryKey, loader) => {
    const query = useQuery({
        queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
        queryFn: loader,
        placeholderData: keepPreviousData,
    })

    return {
        data: query.data ?? null,
        error: query.error ? query.error.message || API_MESSAGES.unexpected : '',
        isLoading: query.isFetching,
        reload: query.refetch,
    }
}
