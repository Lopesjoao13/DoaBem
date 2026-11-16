import { formatQuantity } from '@/utils/formatters.js'

export const RECEIPT_COLUMNS = [
    { key: 'itemName', header: 'Item entregue' },
    {
        key: 'approvedQty',
        header: 'Quantidade',
        noWrap: true,
        render: (row) => formatQuantity(row.approvedQty, row.unitOfMeasure),
    },
]
