import { TONES } from '@/constants/tones.js'
import { formatQuantity } from '@/utils/formatters.js'

export const PICK_COLUMNS = [
    { key: 'itemName', header: 'Item' },
    {
        key: 'approvedQty',
        header: 'Aprovado',
        noWrap: true,
        render: (row) => formatQuantity(row.approvedQty, row.unitOfMeasure),
    },
    {
        key: 'available',
        header: 'Disponível',
        noWrap: true,
        render: (row) => formatQuantity(row.available, row.unitOfMeasure),
    },
]
export const getPickRowTone = (row) =>
    row.approvedQty > row.available ? TONES.CRITICAL : undefined
