import { IconX } from '@tabler/icons-react'
import { TOAST_ICONS } from '@/constants/toast.js'
import { CloseButton, Message, Toast, Viewport } from './ToastViewport.styles.js'

export const ToastViewport = ({ toasts, onDismiss }) => (
    <Viewport role="status" aria-live="polite">
        {toasts.map(({ id, type, message }) => {
            const Icon = TOAST_ICONS[type]
            return (
                <Toast key={id} $type={type}>
                    <Icon size={20} stroke={2} />
                    <Message>{message}</Message>
                    <CloseButton
                        type="button"
                        onClick={() => onDismiss(id)}
                        aria-label="Fechar aviso"
                    >
                        <IconX size={16} stroke={2} />
                    </CloseButton>
                </Toast>
            )
        })}
    </Viewport>
)
