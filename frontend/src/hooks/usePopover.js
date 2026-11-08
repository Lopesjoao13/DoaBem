import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { POPOVER_HIDDEN_STYLE } from '@/constants/popover.js'
import { useDismiss } from '@/hooks/useDismiss.js'
import { computePopoverPosition } from '@/utils/popover.js'

export const usePopover = ({ matchWidth = false, limitHeight = false, remeasureKey, onClose }) => {
    const triggerRef = useRef(null)
    const popoverRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)
    const [position, setPosition] = useState(null)
    const refs = useMemo(() => [triggerRef, popoverRef], [])

    const open = useCallback(() => setIsOpen(true), [])

    const close = useCallback(() => {
        setIsOpen(false)
        setPosition(null)
        onClose?.()
    }, [onClose])

    useLayoutEffect(() => {
        if (!isOpen || !popoverRef.current) return
        setPosition(
            computePopoverPosition(triggerRef.current, popoverRef.current, {
                matchWidth,
                limitHeight,
            }),
        )
    }, [isOpen, matchWidth, limitHeight, remeasureKey])

    useDismiss({ isOpen, refs, onDismiss: close })

    return {
        triggerRef,
        popoverRef,
        isOpen,
        open,
        close,
        style: position ?? POPOVER_HIDDEN_STYLE,
    }
}
