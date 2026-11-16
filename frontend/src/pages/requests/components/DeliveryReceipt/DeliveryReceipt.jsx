import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { DescriptionList } from '@/components/DescriptionList/DescriptionList.jsx'
import { FormSection } from '@/components/FormSection/FormSection.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { formatDateTime } from '@/utils/formatters.js'
import { RECEIPT_COLUMNS } from '@/pages/requests/constants/receiptColumns.jsx'

export const DeliveryReceipt = ({ request }) => (
    <FormSection
        title={`Comprovante da entrega #${request.delivery.id}`}
        subtitle="Registro digital da entrega"
    >
        <DescriptionList
            items={[
                { label: 'Entregue em', value: formatDateTime(request.delivery.deliveredAt) },
                { label: 'Entregue por', value: request.delivery.deliveredBy },
                { label: 'Observação', value: request.delivery.notes },
            ]}
        />
        <Panel padded={false}>
            <DataTable
                columns={RECEIPT_COLUMNS}
                rows={request.items.filter((item) => item.approvedQty > 0)}
            />
        </Panel>
    </FormSection>
)
