import { Callout } from '@/components/Callout/Callout.jsx'
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog.jsx'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { Stack } from '@/components/Stack/Stack.jsx'
import { REQUEST_MESSAGES } from '@/constants/requestMessages.js'
import { TONES } from '@/constants/tones.js'
import { useAsyncAction } from '@/hooks/useAsyncAction.js'
import { pickRequest } from '@/services/requestService.js'
import { PICK_COLUMNS, getPickRowTone } from '@/pages/requests/constants/pickColumns.jsx'

export const PickDialog = ({ request, onClose, onDone }) => {
    const { isRunning, run } = useAsyncAction()
    const items = request.items.filter((requestItem) => requestItem.approvedQty > 0)
    const hasShortage = items.some((requestItem) => requestItem.approvedQty > requestItem.available)

    const handleConfirm = async () => {
        const result = await run(() => pickRequest(request.id), REQUEST_MESSAGES.picked)
        if (result) onDone()
    }

    return (
        <ConfirmDialog
            title={`Separar solicitação #${request.id}?`}
            confirmLabel="Separar e reservar"
            family="confirm"
            isRunning={isRunning}
            onConfirm={handleConfirm}
            onClose={onClose}
        >
            <Stack>
                <Callout tone={hasShortage ? TONES.CRITICAL : TONES.INFO}>
                    {hasShortage
                        ? 'Há item com saldo insuficiente. A separação será bloqueada: revise a solicitação ou cancele e crie outra.'
                        : REQUEST_MESSAGES.pickNotice}
                </Callout>
                <DataTable columns={PICK_COLUMNS} rows={items} getRowTone={getPickRowTone} />
            </Stack>
        </ConfirmDialog>
    )
}
