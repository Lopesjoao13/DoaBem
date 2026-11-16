import { useCallback, useMemo, useRef, useState } from 'react'
import { ToastViewport } from '@/components/ToastViewport/ToastViewport.jsx'
import { TOAST_DURATION_MS, TOAST_TYPES } from '@/constants/toast.js'
import { ToastContext } from './ToastContext.js'

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])
    const lastId = useRef(0)

    const dismiss = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id))
    }, [])

    const show = useCallback(
        (type, message) => {
            lastId.current += 1
            const id = lastId.current
            setToasts((current) => [...current, { id, type, message }])
            setTimeout(() => dismiss(id), TOAST_DURATION_MS)
        },
        [dismiss],
    )

    const toast = useMemo(
        () => ({
            success: (message) => show(TOAST_TYPES.SUCCESS, message),
            error: (message) => show(TOAST_TYPES.ERROR, message),
            info: (message) => show(TOAST_TYPES.INFO, message),
        }),
        [show],
    )

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    )
}
