import { formatQuantity } from '@/utils/formatters.js'

export const DELIVER_COLUMNS = [
    { key: 'itemName', header: 'Item' },
    {
        key: 'approvedQty',
        header: 'Quantidade a entregar',
        noWrap: true,
        render: (row) => formatQuantity(row.approvedQty, row.unitOfMeasure),
    },
]
