import { Button } from '@/components/Button/Button.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { DIALOG_SIZES } from '@/constants/dialog.js'
import { Message } from './ConfirmDialog.styles.js'

export const ConfirmDialog = ({
    title,
    message,
    confirmLabel,
    family = 'main',
    isRunning = false,
    onConfirm,
    onClose,
    children,
}) => (
    <Dialog
        isOpen
        size={DIALOG_SIZES.SM}
        title={title}
        onClose={onClose}
        footer={
            <>
                <Button variant="outline" family="deny" onClick={onClose} disabled={isRunning}>
                    Cancelar
                </Button>
                <Button family={family} onClick={onConfirm} disabled={isRunning}>
                    {isRunning ? 'Aguarde...' : confirmLabel}
                </Button>
            </>
        }
    >
        {message && <Message>{message}</Message>}
        {children}
    </Dialog>
)
