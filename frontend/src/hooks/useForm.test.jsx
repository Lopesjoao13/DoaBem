import { QueryObserver } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderHookWithProviders } from '@/test/utils.jsx'
import { queryClient } from '@/lib/queryClient.js'
import { ApiError } from '@/services/apiError.js'
import { useForm } from './useForm.js'

const setup = (overrides = {}) => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const hook = renderHookWithProviders(() =>
        useForm({ initialValues: { name: '', agree: false }, onSubmit, ...overrides }),
    )
    return { onSubmit, ...hook }
}

describe('useForm (useMutation)', () => {
    it('altera campos de texto e checkbox', () => {
        const { result } = setup()
        act(() =>
            result.current.handleChange({ target: { name: 'name', value: 'Ana', type: 'text' } }),
        )
        act(() =>
            result.current.handleChange({
                target: { name: 'agree', checked: true, type: 'checkbox' },
            }),
        )
        expect(result.current.values).toEqual({ name: 'Ana', agree: true })
    })

    it('aceita função atualizadora em changeField', () => {
        const { result } = setup({ initialValues: { lines: [1] } })
        act(() => result.current.changeField('lines', (lines) => [...lines, 2]))
        expect(result.current.values.lines).toEqual([1, 2])
    })

    it('não envia quando a validação falha e expõe os erros', async () => {
        const { result, onSubmit } = setup({ validate: () => ({ name: 'Obrigatório' }) })
        let ok
        await act(async () => {
            ok = await result.current.submit()
        })
        expect(ok).toBe(false)
        expect(onSubmit).not.toHaveBeenCalled()
        expect(result.current.errors).toEqual({ name: 'Obrigatório' })
    })

    it('envia os valores e retorna true', async () => {
        const { result, onSubmit } = setup()
        act(() => result.current.changeField('name', 'Ana'))
        let ok
        await act(async () => {
            ok = await result.current.submit({ preventDefault: vi.fn() })
        })
        expect(ok).toBe(true)
        expect(onSubmit.mock.calls[0][0]).toEqual({ name: 'Ana', agree: false })
    })

    it('mostra a mensagem geral e os fieldErrors vindos do backend', async () => {
        const onSubmit = vi.fn().mockRejectedValue(
            new ApiError(400, 'Revise os campos destacados.', {
                lines: [{ itemId: 'Duplicado' }],
            }),
        )
        const { result } = setup({ onSubmit })
        await act(async () => {
            await result.current.submit()
        })
        expect(result.current.formError).toBe('Revise os campos destacados.')
        expect(result.current.errors).toEqual({ lines: [{ itemId: 'Duplicado' }] })
    })

    it('limpa o erro do campo ao digitar nele', async () => {
        const { result } = setup({ validate: () => ({ name: 'Obrigatório' }) })
        await act(async () => {
            await result.current.submit()
        })
        act(() => result.current.changeField('name', 'A'))
        expect(result.current.errors.name).toBeUndefined()
    })

    it('isSubmitting fica true durante o envio', async () => {
        let finish
        const onSubmit = vi.fn(() => new Promise((resolve) => (finish = resolve)))
        const { result } = setup({ onSubmit })
        let pending
        act(() => {
            pending = result.current.submit()
        })
        await waitFor(() => expect(result.current.isSubmitting).toBe(true))
        await act(async () => {
            finish()
            await pending
        })
        await waitFor(() => expect(result.current.isSubmitting).toBe(false))
    })

    it('reset restaura valores e limpa erros', async () => {
        const { result } = setup({ onSubmit: vi.fn().mockRejectedValue(new Error('falhou')) })
        await act(async () => {
            await result.current.submit()
        })
        act(() => result.current.reset({ name: 'novo', agree: false }))
        expect(result.current.values.name).toBe('novo')
        expect(result.current.formError).toBe('')
    })

    it('escrita bem-sucedida invalida as consultas do cache global', async () => {
        const fetcher = vi.fn().mockResolvedValue('dados')
        const observer = new QueryObserver(queryClient, { queryKey: ['lista'], queryFn: fetcher })
        const unsubscribe = observer.subscribe(() => {})
        await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

        const { result } = renderHookWithProviders(
            () => useForm({ initialValues: {}, onSubmit: vi.fn().mockResolvedValue('ok') }),
            { client: queryClient },
        )
        await act(async () => {
            await result.current.submit()
        })

        await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
        unsubscribe()
    })

    it('escrita com falha NÃO invalida o cache', async () => {
        const fetcher = vi.fn().mockResolvedValue('dados')
        const observer = new QueryObserver(queryClient, { queryKey: ['lista'], queryFn: fetcher })
        const unsubscribe = observer.subscribe(() => {})
        await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))

        const { result } = renderHookWithProviders(
            () =>
                useForm({ initialValues: {}, onSubmit: vi.fn().mockRejectedValue(new Error('x')) }),
            { client: queryClient },
        )
        await act(async () => {
            await result.current.submit()
        })

        expect(fetcher).toHaveBeenCalledTimes(1)
        unsubscribe()
    })
})
