import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog.jsx'
import { USER_MESSAGES } from '@/constants/userMessages.js'
import { useAsyncAction } from '@/hooks/useAsyncAction.js'
import { setUserActive } from '@/services/userService.js'

export const UserActionConfirm = ({ user, onClose, onDone }) => {
    const { isRunning, run } = useAsyncAction()

    const handleConfirm = async () => {
        const result = await run(
            () => setUserActive(user.id, !user.active),
            user.active ? USER_MESSAGES.deactivated : USER_MESSAGES.activated,
        )
        if (result) onDone()
    }

    return (
        <ConfirmDialog
            title={user.active ? `Desativar ${user.name}?` : `Reativar ${user.name}?`}
            message={
                user.active
                    ? 'O usuário não conseguirá mais entrar. O histórico de ações dele é mantido.'
                    : 'O usuário volta a poder entrar com a senha atual.'
            }
            confirmLabel={user.active ? 'Desativar' : 'Reativar'}
            family={user.active ? 'deny' : 'confirm'}
            isRunning={isRunning}
            onConfirm={handleConfirm}
            onClose={onClose}
        />
    )
}
