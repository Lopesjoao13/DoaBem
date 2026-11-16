import { act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { API_MESSAGES } from '@/constants/apiMessages.js'
import { ApiError } from '@/services/apiError.js'
import { renderHookWithProviders } from '@/test/utils.jsx'
import { useAsyncAction } from './useAsyncAction.js'
import { useToast } from './useToast.js'

const setup = () => renderHookWithProviders(() => ({ action: useAsyncAction(), toast: useToast() }))

describe('useAsyncAction (useMutation)', () => {
    it('devolve o resultado da ação e mostra o toast de sucesso', async () => {
        const { result } = setup()
        const success = vi.spyOn(result.current.toast, 'success')
        let value
        await act(async () => {
            value = await result.current.action.run(() => Promise.resolve({ id: 5 }), 'Salvo!')
        })
        expect(value).toEqual({ id: 5 })
        expect(success).toHaveBeenCalledWith('Salvo!')
    })

    it('devolve true quando a ação não retorna nada', async () => {
        const { result } = setup()
        let value
        await act(async () => {
            value = await result.current.action.run(() => Promise.resolve())
        })
        expect(value).toBe(true)
    })

    it('em falha devolve null e não propaga a exceção', async () => {
        const { result } = setup()
        vi.spyOn(console, 'error').mockImplementation(() => {})
        const error = vi.spyOn(result.current.toast, 'error')
        let value = 'unset'
        await act(async () => {
            value = await result.current.action.run(() =>
                Promise.reject(new ApiError(409, 'Já existe.')),
            )
        })
        expect(value).toBeNull()
        expect(error).toHaveBeenCalledWith('Já existe.')
    })

    it('em falha sem mensagem não quebra (usa o texto padrão)', async () => {
        const { result } = setup()
        vi.spyOn(console, 'error').mockImplementation(() => {})
        const error = vi.spyOn(result.current.toast, 'error')
        await act(async () => {
            await result.current.action.run(() => Promise.reject(new Error('')))
        })
        expect(error).toHaveBeenCalledWith(API_MESSAGES.unexpected)
    })

    it('isRunning é true enquanto a ação executa', async () => {
        const { result } = setup()
        let finish
        let pending
        act(() => {
            pending = result.current.action.run(() => new Promise((resolve) => (finish = resolve)))
        })
        await waitFor(() => expect(result.current.action.isRunning).toBe(true))
        await act(async () => {
            finish('ok')
            await pending
        })
        await waitFor(() => expect(result.current.action.isRunning).toBe(false))
    })
})
