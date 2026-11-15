import { MutationCache, QueryClient } from '@tanstack/react-query'

const STALE_TIME_MS = 30_000

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false, refetchOnWindowFocus: false, staleTime: STALE_TIME_MS },
    },
    mutationCache: new MutationCache({
        onSuccess: () => queryClient.invalidateQueries(),
    }),
})
