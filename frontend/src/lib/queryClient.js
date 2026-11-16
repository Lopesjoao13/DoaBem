import { MutationCache, QueryClient } from '@tanstack/react-query'
import { STALE_TIME } from '@/constants/queryKeys.js'

const GC_TIME_MS = 10 * 60_000

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
            staleTime: STALE_TIME.DEFAULT,
            gcTime: GC_TIME_MS,
        },
    },
    mutationCache: new MutationCache({
        // meta.invalidates lista as consultas afetadas; sem ela, invalida tudo (padrão seguro).
        onSuccess: (_data, _variables, _context, mutation) => {
            const keys = mutation.meta?.invalidates
            if (!keys) {
                queryClient.invalidateQueries()
                return
            }
            keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }))
        },
    }),
})
