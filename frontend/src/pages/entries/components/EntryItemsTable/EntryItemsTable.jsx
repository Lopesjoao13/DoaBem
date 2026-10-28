import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { formatDate, formatQuantity } from '@/utils/formatters.js'

const COLUMNS = [
    { key: 'itemName', header: 'Item' },
    {
        key: 'quantity',
        header: 'Quantidade',
        align: 'right',
        noWrap: true,
        render: (row) => formatQuantity(row.quantity, row.unitOfMeasure),
    },
    {
        key: 'expiryDate',
        header: 'Validade (informativa)',
        render: (row) => (row.expiryDate ? formatDate(row.expiryDate) : '—'),
    },
]

export const EntryItemsTable = ({ items }) => <DataTable columns={COLUMNS} rows={items} />
