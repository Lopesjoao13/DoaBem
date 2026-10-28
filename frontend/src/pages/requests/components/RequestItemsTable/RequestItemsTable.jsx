import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { REQUEST_STATUS } from '@/constants/requestStatus.js'
import { formatQuantity } from '@/utils/formatters.js'

const STATUSES_WITH_AVAILABLE = [REQUEST_STATUS.PENDING, REQUEST_STATUS.APPROVED]

const quantityColumn = (key, header, getValue) => ({
    key,
    header,
    align: 'right',
    noWrap: true,
    render: (row) => {
        const value = getValue(row)
        return value === null || value === undefined
            ? '—'
            : formatQuantity(value, row.unitOfMeasure)
    },
})

const buildColumns = (status) => [
    { key: 'itemName', header: 'Item' },
    quantityColumn('requestedQty', 'Solicitado', (row) => row.requestedQty),
    quantityColumn('approvedQty', 'Aprovado', (row) => row.approvedQty),
    ...(STATUSES_WITH_AVAILABLE.includes(status)
        ? [quantityColumn('available', 'Disponível agora', (row) => row.available)]
        : []),
    ...(status === REQUEST_STATUS.PICKED
        ? [quantityColumn('reserved', 'Reservado', (row) => row.approvedQty)]
        : []),
    ...(status === REQUEST_STATUS.DELIVERED
        ? [quantityColumn('delivered', 'Entregue', (row) => row.approvedQty)]
        : []),
]

export const RequestItemsTable = ({ request }) => (
    <DataTable columns={buildColumns(request.status)} rows={request.items} />
)
