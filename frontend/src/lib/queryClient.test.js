import { QueryObserver } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { INVALIDATES, QUERY_KEYS, STALE_TIME } from '@/constants/queryKeys.js'
import { queryClient } from './queryClient.js'

const observe = (key) => {
    const fetcher = vi.fn().mockResolvedValue(key)
    const observer = new QueryObserver(queryClient, {
        queryKey: [key, { filtro: 1 }],
        queryFn: fetcher,
    })
    return { fetcher, unsubscribe: observer.subscribe(() => {}) }
}

const runMutation = (meta) =>
    queryClient
        .getMutationCache()
        .build(queryClient, { mutationFn: async () => 'ok', meta })
        .execute()

describe('queryClient', () => {
    it('padrões: staleTime de 30 s, sem retry e sem refetch ao focar a janela', () => {
        const { queries } = queryClient.getDefaultOptions()
        expect(queries).toMatchObject({
            staleTime: STALE_TIME.DEFAULT,
            retry: false,
            refetchOnWindowFocus: false,
        })
        expect(STALE_TIME.REFERENCE).toBeGreaterThan(STALE_TIME.DEFAULT)
    })

    it('mutação com meta.invalidates refaz só as consultas listadas', async () => {
        const users = observe(QUERY_KEYS.USERS)
        const items = observe(QUERY_KEYS.ITEMS)
        await waitFor(() => expect(users.fetcher).toHaveBeenCalledTimes(1))
        await waitFor(() => expect(items.fetcher).toHaveBeenCalledTimes(1))

        await runMutation({ invalidates: [QUERY_KEYS.USERS] })

        await waitFor(() => expect(users.fetcher).toHaveBeenCalledTimes(2))
        expect(items.fetcher).toHaveBeenCalledTimes(1)
        users.unsubscribe()
        items.unsubscribe()
    })

    it('mutação sem meta invalida tudo (padrão seguro)', async () => {
        const users = observe(QUERY_KEYS.USERS)
        const stock = observe(QUERY_KEYS.STOCK)
        await waitFor(() => expect(stock.fetcher).toHaveBeenCalledTimes(1))

        await runMutation(undefined)

        await waitFor(() => expect(users.fetcher).toHaveBeenCalledTimes(2))
        await waitFor(() => expect(stock.fetcher).toHaveBeenCalledTimes(2))
        users.unsubscribe()
        stock.unsubscribe()
    })

    it('chaves com filtros também são invalidadas (casamento por prefixo)', async () => {
        const stock = observe(QUERY_KEYS.STOCK)
        await waitFor(() => expect(stock.fetcher).toHaveBeenCalledTimes(1))
        await runMutation({ invalidates: INVALIDATES.STOCK_CHANGE })
        await waitFor(() => expect(stock.fetcher).toHaveBeenCalledTimes(2))
        stock.unsubscribe()
    })

    it('toda escrita de estoque/solicitação atualiza dashboard e movimentações', () => {
        for (const group of [INVALIDATES.STOCK_CHANGE, INVALIDATES.REQUEST_CHANGE]) {
            expect(group).toEqual(
                expect.arrayContaining([
                    QUERY_KEYS.STOCK,
                    QUERY_KEYS.MOVEMENTS,
                    QUERY_KEYS.DASHBOARD,
                ]),
            )
        }
        expect(INVALIDATES.REQUEST_CHANGE).toEqual(
            expect.arrayContaining([
                QUERY_KEYS.REQUESTS,
                QUERY_KEYS.FAMILY_HISTORY,
                QUERY_KEYS.DELIVERY_SUMMARY,
            ]),
        )
    })

    it('todas as chaves usadas em INVALIDATES existem em QUERY_KEYS', () => {
        const known = new Set(Object.values(QUERY_KEYS))
        Object.values(INVALIDATES)
            .flat()
            .forEach((key) => expect(known.has(key)).toBe(true))
    })
})
