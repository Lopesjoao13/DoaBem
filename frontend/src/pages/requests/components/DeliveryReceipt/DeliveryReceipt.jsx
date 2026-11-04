import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { DescriptionList } from '@/components/DescriptionList/DescriptionList.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { Stack } from '@/components/Stack/Stack.jsx'
import { formatDateTime, formatQuantity } from '@/utils/formatters.js'

const COLUMNS = [
    { key: 'itemName', header: 'Item entregue' },
    {
        key: 'approvedQty',
        header: 'Quantidade',
        align: 'right',
        noWrap: true,
        render: (row) => formatQuantity(row.approvedQty, row.unitOfMeasure),
    },
]

export const DeliveryReceipt = ({ request }) => (
    <Panel
        title={`Comprovante da entrega #${request.delivery.id}`}
        subtitle="Registro digital da entrega"
    >
        <Stack>
            <DescriptionList
                items={[
                    {
                        label: 'Família',
                        value: `#${request.beneficiary.id} — ${request.beneficiary.responsibleName}`,
                    },
                    { label: 'Entregue em', value: formatDateTime(request.delivery.deliveredAt) },
                    { label: 'Entregue por', value: request.delivery.deliveredBy },
                    { label: 'Observação', value: request.delivery.notes },
                ]}
            />
            <DataTable
                columns={COLUMNS}
                rows={request.items.filter((item) => item.approvedQty > 0)}
            />
        </Stack>
    </Panel>
)
