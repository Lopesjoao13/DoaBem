import { useCallback, useState } from 'react'
import { API_MESSAGES } from '@/constants/apiMessages.js'
import { useToast } from '@/hooks/useToast.js'

export const useAsyncAction = () => {
    const toast = useToast()
    const [isRunning, setIsRunning] = useState(false)

    const run = useCallback(
        async (action, successMessage) => {
            setIsRunning(true)
            try {
                const result = await action()
                if (successMessage) toast.success(successMessage)
                return result ?? true
            } catch (error) {
                console.error('Falha na ação:', error.message)
                toast.error(error.message || API_MESSAGES.unexpected)
                return null
            } finally {
                setIsRunning(false)
            }
        },
        [toast],
    )

    return { isRunning, run }
}
