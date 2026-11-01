import { describeEntrySource } from '@/utils/entries.js'
import { formatDate } from '@/utils/formatters.js'

export const ENTRIES_EXPORT_COLUMNS = [
    { header: 'Nº', value: (row) => row.id },
    { header: 'Data', value: (row) => formatDate(row.entryDate) },
    { header: 'Origem', value: (row) => describeEntrySource(row) },
    {
        header: 'Itens recebidos',
        value: (row) => row.receivedItems.map((item) => item.itemName).join(', '),
    },
    { header: 'Registrado por', value: (row) => row.registeredBy },
]
