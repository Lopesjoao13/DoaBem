import { IconX } from '@tabler/icons-react'
import { useEffect, useId, useRef } from 'react'
import { DIALOG_KINDS, DIALOG_SIZES } from '@/constants/dialog.js'
import {
    Body,
    CloseButton,
    Description,
    Footer,
    Header,
    Overlay,
    Panel,
    Title,
} from './Dialog.styles.js'

export const Dialog = ({
    isOpen,
    title,
    description,
    kind = DIALOG_KINDS.FORM,
    size = DIALOG_SIZES.MD,
    footer,
    onClose,
    children,
}) => {
    const titleId = useId()
    const panelRef = useRef(null)
    const isView = kind === DIALOG_KINDS.VIEW

    useEffect(() => {
        if (isOpen) panelRef.current?.focus()
    }, [isOpen])

    if (!isOpen) return null

    const handleKeyDown = (event) => {
        if (event.key === 'Escape' && isView) onClose()
    }

    const handleOverlayClick = (event) => {
        if (isView && event.target === event.currentTarget) onClose()
    }

    return (
        <Overlay onMouseDown={handleOverlayClick} onKeyDown={handleKeyDown}>
            <Panel
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                $size={size}
            >
                <Header>
                    <div>
                        <Title id={titleId}>{title}</Title>
                        {description && <Description>{description}</Description>}
                    </div>
                    {isView && (
                        <CloseButton type="button" onClick={onClose} aria-label="Fechar">
                            <IconX size={18} stroke={2} />
                        </CloseButton>
                    )}
                </Header>
                <Body>{children}</Body>
                {footer && <Footer>{footer}</Footer>}
            </Panel>
        </Overlay>
    )
}
