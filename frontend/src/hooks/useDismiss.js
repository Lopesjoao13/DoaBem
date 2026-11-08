import { useEffect } from 'react'

export const useDismiss = ({ isOpen, refs, onDismiss, closesOnOutsideClick = true }) => {
    useEffect(() => {
        if (!isOpen) return undefined
        const isInside = (target) => refs.some((ref) => ref.current?.contains(target))
        const handleOutsideClick = (event) => {
            if (!isInside(event.target)) onDismiss()
        }
        const handleScroll = (event) => {
            if (!isInside(event.target)) onDismiss()
        }
        const handleKeyDown = (event) => {
            if (event.key !== 'Escape') return
            event.stopPropagation()
            onDismiss()
        }
        if (closesOnOutsideClick) document.addEventListener('mousedown', handleOutsideClick)
        document.addEventListener('keydown', handleKeyDown, true)
        window.addEventListener('scroll', handleScroll, true)
        window.addEventListener('resize', onDismiss)
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick)
            document.removeEventListener('keydown', handleKeyDown, true)
            window.removeEventListener('scroll', handleScroll, true)
            window.removeEventListener('resize', onDismiss)
        }
    }, [isOpen, refs, onDismiss, closesOnOutsideClick])
}
