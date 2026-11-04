import { Callout } from '@/components/Callout/Callout.jsx'
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog.jsx'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { Stack } from '@/components/Stack/Stack.jsx'
import { REQUEST_MESSAGES } from '@/constants/requestMessages.js'
import { TONES } from '@/constants/tones.js'
import { useAsyncAction } from '@/hooks/useAsyncAction.js'
import { pickRequest } from '@/services/requestService.js'
import { formatQuantity } from '@/utils/formatters.js'

const COLUMNS = [
    { key: 'itemName', header: 'Item' },
    {
        key: 'approvedQty',
        header: 'Aprovado',
        align: 'right',
        noWrap: true,
        render: (row) => formatQuantity(row.approvedQty, row.unitOfMeasure),
    },
    {
        key: 'available',
        header: 'Disponível',
        align: 'right',
        noWrap: true,
        render: (row) => formatQuantity(row.available, row.unitOfMeasure),
    },
]

const getRowTone = (row) => (row.approvedQty > row.available ? TONES.CRITICAL : undefined)

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
                <DataTable columns={COLUMNS} rows={items} getRowTone={getRowTone} />
            </Stack>
        </ConfirmDialog>
    )
}
