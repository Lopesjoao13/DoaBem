import { useMutation } from '@tanstack/react-query'
import { API_MESSAGES } from '@/constants/apiMessages.js'
import { useToast } from '@/hooks/useToast.js'

export const useAsyncAction = ({ invalidates } = {}) => {
    const toast = useToast()
    const mutation = useMutation({ mutationFn: (action) => action(), meta: { invalidates } })

    const run = async (action, successMessage) => {
        try {
            const result = await mutation.mutateAsync(action)
            if (successMessage) toast.success(successMessage)
            return result ?? true
        } catch (error) {
            console.error('Falha na ação:', error.message)
            toast.error(error.message || API_MESSAGES.unexpected)
            return null
        }
    }

    return { isRunning: mutation.isPending, run }
}
