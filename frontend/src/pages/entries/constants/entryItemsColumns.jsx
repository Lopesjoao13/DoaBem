import { formatDate, formatQuantity } from '@/utils/formatters.js'

export const ENTRY_ITEMS_COLUMNS = [
    { key: 'itemName', header: 'Item' },
    {
        key: 'quantity',
        header: 'Quantidade',
        noWrap: true,
        render: (row) => formatQuantity(row.quantity, row.unitOfMeasure),
    },
    {
        key: 'expiryDate',
        header: 'Validade (informativa)',
        render: (row) => (row.expiryDate ? formatDate(row.expiryDate) : '—'),
    },
]
