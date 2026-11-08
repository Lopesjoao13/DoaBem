import { MOVEMENT_TYPE_LABELS } from '@/constants/movementTypes.js'
import { formatDateTime, formatQuantity } from '@/utils/formatters.js'

export const MOVEMENTS_EXPORT_COLUMNS = [
    { header: 'Nº', value: (row) => row.id },
    { header: 'Data/hora', value: (row) => formatDateTime(row.occurredAt) },
    { header: 'Tipo', value: (row) => MOVEMENT_TYPE_LABELS[row.type] },
    { header: 'Item', value: (row) => row.itemName },
    { header: 'Quantidade', value: (row) => formatQuantity(row.quantity, row.unitOfMeasure) },
    { header: 'Referência', value: (row) => row.reference.label },
    { header: 'Responsável', value: (row) => row.userName },
]
