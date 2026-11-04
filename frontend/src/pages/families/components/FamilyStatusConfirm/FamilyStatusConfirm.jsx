import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog.jsx'
import { FAMILY_MESSAGES } from '@/constants/familyMessages.js'
import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { useAsyncAction } from '@/hooks/useAsyncAction.js'
import { setBeneficiaryStatus } from '@/services/beneficiaryService.js'

export const FamilyStatusConfirm = ({ family, onClose, onChanged }) => {
    const { isRunning, run } = useAsyncAction()
    const isActive = family.status === RECORD_STATUS.ACTIVE

    const handleConfirm = async () => {
        const result = await run(
            () =>
                setBeneficiaryStatus(
                    family.id,
                    isActive ? RECORD_STATUS.INACTIVE : RECORD_STATUS.ACTIVE,
                ),
            isActive ? FAMILY_MESSAGES.inactivated : FAMILY_MESSAGES.reactivated,
        )
        if (result) onChanged()
    }

    return (
        <ConfirmDialog
            title={
                isActive
                    ? `Inativar ${family.responsibleName}?`
                    : `Reativar ${family.responsibleName}?`
            }
            message={
                isActive
                    ? 'Famílias inativas não recebem novas solicitações. O histórico continua disponível. Não é possível inativar com solicitação em andamento.'
                    : 'A família volta a poder receber novas solicitações.'
            }
            confirmLabel={isActive ? 'Inativar' : 'Reativar'}
            family={isActive ? 'deny' : 'confirm'}
            isRunning={isRunning}
            onConfirm={handleConfirm}
            onClose={onClose}
        />
    )
}
