import { Callout } from '@/components/Callout/Callout.jsx'
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog.jsx'
import { INVALIDATES } from '@/constants/queryKeys.js'
import { REQUEST_MESSAGES } from '@/constants/requestMessages.js'
import { TONES } from '@/constants/tones.js'
import { useAsyncAction } from '@/hooks/useAsyncAction.js'
import { reopenRequest } from '@/services/requestService.js'

export const ReopenDialog = ({ request, onClose, onDone }) => {
    const { isRunning, run } = useAsyncAction({ invalidates: INVALIDATES.REQUEST_CHANGE })

    const handleConfirm = async () => {
        const result = await run(() => reopenRequest(request.id), REQUEST_MESSAGES.reopened)
        if (result) onDone()
    }

    return (
        <ConfirmDialog
            title={`Reabrir análise da solicitação #${request.id}?`}
            confirmLabel="Reabrir análise"
            family="confirm"
            isRunning={isRunning}
            onConfirm={handleConfirm}
            onClose={onClose}
        >
            <Callout tone={TONES.INFO}>
                A solicitação volta para pendente e a aprovação atual é descartada. Depois você pode
                aprovar com outras quantidades ou recusar.
            </Callout>
        </ConfirmDialog>
    )
}
