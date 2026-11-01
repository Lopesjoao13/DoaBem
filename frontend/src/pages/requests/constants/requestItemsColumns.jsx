import { REQUEST_STATUS } from '@/constants/requestStatus.js'
import { formatQuantity } from '@/utils/formatters.js'
import { OPEN_STATUSES } from '@/pages/requests/constants/requestOptions.js'

export const quantityColumn = (key, header, getValue) => ({
    key,
    header,
    noWrap: true,
    render: (row) => {
        const value = getValue(row)
        return value === null || value === undefined
            ? '—'
            : formatQuantity(value, row.unitOfMeasure)
    },
})
export const buildRequestItemsColumns = (status) => [
    { key: 'itemName', header: 'Item' },
    quantityColumn('requestedQty', 'Solicitado', (row) => row.requestedQty),
    quantityColumn('approvedQty', 'Aprovado', (row) => row.approvedQty),
    ...(OPEN_STATUSES.includes(status)
        ? [quantityColumn('available', 'Disponível agora', (row) => row.available)]
        : []),
    ...(status === REQUEST_STATUS.PICKED
        ? [quantityColumn('reserved', 'Reservado', (row) => row.approvedQty)]
        : []),
    ...(status === REQUEST_STATUS.DELIVERED
        ? [quantityColumn('delivered', 'Entregue', (row) => row.approvedQty)]
        : []),
]
