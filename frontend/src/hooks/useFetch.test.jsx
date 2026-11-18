import { act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { API_MESSAGES } from '@/constants/apiMessages.js'
import { ApiError } from '@/services/apiError.js'
import { renderHookWithProviders } from '@/test/utils.jsx'
import { useFetch } from './useFetch.js'

describe('useFetch (useQuery)', () => {
    it('começa carregando e entrega os dados', async () => {
        const loader = vi.fn().mockResolvedValue({ content: [1] })
        const { result } = renderHookWithProviders(() => useFetch('k1', loader))

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeNull()
        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(result.current.data).toEqual({ content: [1] })
        expect(result.current.error).toBe('')
    })

    it('expõe a mensagem do erro', async () => {
        const loader = vi.fn().mockRejectedValue(new ApiError(409, 'Conflito de dados.'))
        const { result } = renderHookWithProviders(() => useFetch('k2', loader))

        await waitFor(() => expect(result.current.error).toBe('Conflito de dados.'))
        expect(result.current.data).toBeNull()
    })

    it('usa a mensagem padrão quando o erro não tem texto', async () => {
        const loader = vi.fn().mockRejectedValue(new Error(''))
        const { result } = renderHookWithProviders(() => useFetch('k3', loader))

        await waitFor(() => expect(result.current.error).toBe(API_MESSAGES.unexpected))
    })

    it('reload refaz a requisição', async () => {
        const loader = vi.fn().mockResolvedValueOnce('a').mockResolvedValueOnce('b')
        const { result } = renderHookWithProviders(() => useFetch('k4', loader))
        await waitFor(() => expect(result.current.data).toBe('a'))

        await act(() => result.current.reload())

        await waitFor(() => expect(result.current.data).toBe('b'))
        expect(loader).toHaveBeenCalledTimes(2)
    })

    it('chaves iguais compartilham o cache (uma só requisição)', async () => {
        const loader = vi.fn().mockResolvedValue('x')
        const first = renderHookWithProviders(() =>
            useFetch(['lista', { status: 'ACTIVE' }], loader),
        )
        await waitFor(() => expect(first.result.current.data).toBe('x'))

        const second = renderHookWithProviders(
            () => useFetch(['lista', { status: 'ACTIVE' }], loader),
            {
                client: first.client,
            },
        )
        await waitFor(() => expect(second.result.current.data).toBe('x'))
        expect(loader).toHaveBeenCalledTimes(1)
    })

    it('trocar a chave (filtro) busca de novo e mantém os dados anteriores durante o carregamento', async () => {
        let resolveSecond
        const loader = vi
            .fn()
            .mockResolvedValueOnce('ativos')
            .mockImplementationOnce(() => new Promise((resolve) => (resolveSecond = resolve)))
        const { result, rerender } = renderHookWithProviders(
            ({ status }) => useFetch(['familias', { status }], loader),
            { initialProps: { status: 'ACTIVE' } },
        )
        await waitFor(() => expect(result.current.data).toBe('ativos'))

        rerender({ status: 'INACTIVE' })

        await waitFor(() => expect(loader).toHaveBeenCalledTimes(2))
        expect(result.current.data).toBe('ativos')
        expect(result.current.isLoading).toBe(true)
        await act(async () => resolveSecond('inativos'))
        await waitFor(() => expect(result.current.data).toBe('inativos'))
    })

    it('aceita chave em string simples', async () => {
        const loader = vi.fn().mockResolvedValue(1)
        const { result, client } = renderHookWithProviders(() => useFetch('simples', loader))
        await waitFor(() => expect(result.current.data).toBe(1))
        expect(client.getQueryData(['simples'])).toBe(1)
    })
})
