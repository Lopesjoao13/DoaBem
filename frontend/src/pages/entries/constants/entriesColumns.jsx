import { IconEye } from '@tabler/icons-react'
import { IconButton } from '@/components/IconButton/IconButton.jsx'
import { describeEntrySource } from '@/utils/entries.js'
import { formatDate } from '@/utils/formatters.js'

export const buildEntriesColumns = (onOpen) => [
    {
        key: 'entryDate',
        header: 'Data',
        noWrap: true,
        sortValue: (row) => row.entryDate,
        render: (row) => formatDate(row.entryDate),
    },
    {
        key: 'source',
        header: 'Entrada / origem',
        sortValue: (row) => describeEntrySource(row),
        render: (row) => `Entrada #${row.id} — ${describeEntrySource(row)}`,
    },
    { key: 'registeredBy', header: 'Registrado por', sortValue: (row) => row.registeredBy },
    {
        key: 'actions',
        header: 'Ações',
        render: (row) => (
            <IconButton icon={IconEye} label="Ver detalhe" onClick={() => onOpen(row.id)} />
        ),
    },
]
