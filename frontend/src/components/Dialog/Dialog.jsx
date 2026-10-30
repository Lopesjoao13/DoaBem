import { IconX } from '@tabler/icons-react'
import { useEffect, useId, useRef } from 'react'
import { DIALOG_VARIANTS } from '@/constants/dialog.js'
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
    variant = DIALOG_VARIANTS.DRAWER,
    footer,
    onClose,
    children,
}) => {
    const titleId = useId()
    const panelRef = useRef(null)

    useEffect(() => {
        if (isOpen) panelRef.current?.focus()
    }, [isOpen])

    if (!isOpen) return null

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') onClose()
    }

    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget) onClose()
    }

    return (
        <Overlay $variant={variant} onMouseDown={handleOverlayClick} onKeyDown={handleKeyDown}>
            <Panel
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                $variant={variant}
            >
                <Header>
                    <div>
                        <Title id={titleId}>{title}</Title>
                        {description && <Description>{description}</Description>}
                    </div>
                    <CloseButton type="button" onClick={onClose} aria-label="Fechar">
                        <IconX size={18} stroke={2} />
                    </CloseButton>
                </Header>
                <Body>{children}</Body>
                {footer && <Footer>{footer}</Footer>}
            </Panel>
        </Overlay>
    )
}
