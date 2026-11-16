import { RECORD_STATUS_LABELS } from '@/constants/recordStatus.js'
import { STOCK_LEVEL_LABELS } from '@/constants/stockLevels.js'
import { UNIT_LABELS } from '@/constants/units.js'
import { formatNumber } from '@/utils/formatters.js'

export const STOCK_EXPORT_COLUMNS = [
    { header: 'Item', value: (row) => row.name },
    { header: 'Categoria', value: (row) => row.categoryName },
    { header: 'Unidade', value: (row) => UNIT_LABELS[row.unitOfMeasure] },
    { header: 'Físico', value: (row) => formatNumber(row.physical, 3) },
    { header: 'Reservado', value: (row) => formatNumber(row.reserved, 3) },
    { header: 'Disponível', value: (row) => formatNumber(row.available, 3) },
    { header: 'Estoque mínimo', value: (row) => formatNumber(row.minStock, 3) },
    { header: 'Nível', value: (row) => STOCK_LEVEL_LABELS[row.level] },
    { header: 'Situação', value: (row) => RECORD_STATUS_LABELS[row.status] },
]
