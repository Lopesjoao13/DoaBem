import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog.jsx'
import { CATALOG_MESSAGES, CATALOG_TARGETS } from '@/constants/catalogMessages.js'
import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { useAsyncAction } from '@/hooks/useAsyncAction.js'
import { setCategoryActive, setItemStatus } from '@/services/catalogService.js'

const describeTarget = ({ kind, record }) => {
    if (kind === CATALOG_TARGETS.ITEM) {
        const isActive = record.status === RECORD_STATUS.ACTIVE
        return {
            isActive,
            title: isActive ? `Inativar ${record.name}?` : `Reativar ${record.name}?`,
            message: isActive
                ? 'O item deixa de aparecer em novas entradas, solicitações e ajustes, mas continua nos históricos. Não é possível inativar com reserva ativa ou saldo disponível.'
                : 'O item volta a aparecer em novas entradas, solicitações e ajustes.',
            action: () =>
                setItemStatus(record.id, isActive ? RECORD_STATUS.INACTIVE : RECORD_STATUS.ACTIVE),
            success: isActive ? CATALOG_MESSAGES.itemInactivated : CATALOG_MESSAGES.itemReactivated,
        }
    }
    return {
        isActive: record.active,
        title: record.active ? `Inativar ${record.name}?` : `Reativar ${record.name}?`,
        message: record.active
            ? 'Novos itens não poderão usar esta categoria. Inative os itens ativos dela antes.'
            : 'A categoria volta a aceitar novos itens.',
        action: () => setCategoryActive(record.id, !record.active),
        success: record.active
            ? CATALOG_MESSAGES.categoryInactivated
            : CATALOG_MESSAGES.categoryReactivated,
    }
}

export const StatusConfirm = ({ target, onClose, onChanged }) => {
    const { isRunning, run } = useAsyncAction()
    const description = describeTarget(target)

    const handleConfirm = async () => {
        const result = await run(description.action, description.success)
        if (result) onChanged()
    }

    return (
        <ConfirmDialog
            title={description.title}
            message={description.message}
            confirmLabel={description.isActive ? 'Inativar' : 'Reativar'}
            family={description.isActive ? 'deny' : 'confirm'}
            isRunning={isRunning}
            onConfirm={handleConfirm}
            onClose={onClose}
        />
    )
}
