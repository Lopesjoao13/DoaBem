import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog.jsx'

export const DiscardConfirm = ({ onKeepEditing, onDiscard }) => (
    <ConfirmDialog
        title="Descartar alterações?"
        message="Os dados preenchidos serão perdidos."
        confirmLabel="Descartar"
        family="deny"
        onConfirm={onDiscard}
        onClose={onKeepEditing}
    />
)
