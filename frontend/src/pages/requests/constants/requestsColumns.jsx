import { IconEye } from '@tabler/icons-react'
import { Badge } from '@/components/Badge/Badge.jsx'
import { IconButton } from '@/components/IconButton/IconButton.jsx'
import { REQUEST_STATUS_LABELS, REQUEST_STATUS_TONES } from '@/constants/requestStatus.js'
import { formatDate } from '@/utils/formatters.js'

export const buildRequestsColumns = (onOpen) => [
    { key: 'id', header: 'Nº', sortValue: (row) => row.id, render: (row) => `#${row.id}` },
    {
        key: 'createdAt',
        header: 'Data',
        noWrap: true,
        sortValue: (row) => row.createdAt,
        render: (row) => formatDate(row.createdAt),
    },
    { key: 'beneficiaryName', header: 'Família', sortValue: (row) => row.beneficiaryName },
    { key: 'itemCount', header: 'Itens', sortValue: (row) => row.itemCount },
    { key: 'requestedBy', header: 'Criada por', sortValue: (row) => row.requestedBy },
    {
        key: 'status',
        header: 'Estado',
        sortValue: (row) => REQUEST_STATUS_LABELS[row.status],
        render: (row) => (
            <Badge tone={REQUEST_STATUS_TONES[row.status]}>
                {REQUEST_STATUS_LABELS[row.status]}
            </Badge>
        ),
    },
    {
        key: 'actions',
        header: 'Ações',
        render: (row) => (
            <IconButton icon={IconEye} label="Ver detalhe" onClick={() => onOpen(row.id)} />
        ),
    },
]
