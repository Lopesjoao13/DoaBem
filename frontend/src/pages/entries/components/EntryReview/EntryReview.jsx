import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { DescriptionList } from '@/components/DescriptionList/DescriptionList.jsx'
import { Stack } from '@/components/Stack/Stack.jsx'
import { describeEntrySource } from '@/utils/entries.js'
import { formatDate, formatQuantity } from '@/utils/formatters.js'
import { parseQuantity } from '@/utils/quantity.js'

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

export const EntryReview = ({ values, itemsById, userName }) => {
    const rows = values.lines.map((line) => {
        const item = itemsById.get(line.itemId)
        return {
            id: line.key,
            itemName: item.name,
            unitOfMeasure: item.unitOfMeasure,
            quantity: parseQuantity(line.quantity),
            expiryDate: line.expiryDate,
        }
    })

    return (
        <Stack gap={24}>
            <DescriptionList
                items={[
                    { label: 'Data', value: formatDate(values.entryDate) },
                    { label: 'Origem', value: describeEntrySource(values) },
                    { label: 'Responsável', value: userName },
                    { label: 'Observação', value: values.notes },
                ]}
            />
            <DataTable columns={COLUMNS} rows={rows} />
        </Stack>
    )
}
