import { useContext } from 'react'
import { ToastContext } from '@/contexts/ToastContext.js'

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) throw new Error('useToast deve ser usado dentro de ToastProvider')
    return context
}
