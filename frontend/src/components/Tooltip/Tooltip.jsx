import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
    TOOLTIP_FLIP_THRESHOLD_PX,
    TOOLTIP_OFFSET_PX,
    TOOLTIP_PLACEMENTS,
    TOOLTIP_SHOW_DELAY_MS,
} from '@/constants/tooltip.js'
import { NO_REFS } from '@/constants/popover.js'
import { useDismiss } from '@/hooks/useDismiss.js'
import { Bubble, Trigger } from './Tooltip.styles.js'

const computePosition = (element, placement) => {
    const rect = element.getBoundingClientRect()
    if (placement === TOOLTIP_PLACEMENTS.RIGHT) {
        return {
            left: rect.right + TOOLTIP_OFFSET_PX,
            top: rect.top + rect.height / 2,
            placement,
        }
    }
    const isFlipped = rect.top < TOOLTIP_FLIP_THRESHOLD_PX
    return {
        left: rect.left + rect.width / 2,
        top: isFlipped ? rect.bottom + TOOLTIP_OFFSET_PX : rect.top - TOOLTIP_OFFSET_PX,
        isFlipped,
        placement,
    }
}

export const Tooltip = ({
    content,
    placement = TOOLTIP_PLACEMENTS.TOP,
    isBlock = false,
    children,
}) => {
    const triggerRef = useRef(null)
    const timerRef = useRef(null)
    const [position, setPosition] = useState(null)

    const hide = useCallback(() => {
        clearTimeout(timerRef.current)
        setPosition(null)
    }, [])

    const show = useCallback(
        (delay) => {
            clearTimeout(timerRef.current)
            timerRef.current = setTimeout(
                () => setPosition(computePosition(triggerRef.current, placement)),
                delay,
            )
        },
        [placement],
    )

    useDismiss({
        isOpen: Boolean(position),
        refs: NO_REFS,
        onDismiss: hide,
        closesOnOutsideClick: false,
    })

    useEffect(() => () => clearTimeout(timerRef.current), [])

    return (
        <Trigger
            ref={triggerRef}
            $isBlock={isBlock}
            onMouseEnter={() => show(TOOLTIP_SHOW_DELAY_MS)}
            onMouseLeave={hide}
            onFocus={() => show(0)}
            onBlur={hide}
            onClick={hide}
        >
            {children}
            {position &&
                createPortal(
                    <Bubble role="tooltip" $position={position}>
                        {content}
                    </Bubble>,
                    document.body,
                )}
        </Trigger>
    )
}
