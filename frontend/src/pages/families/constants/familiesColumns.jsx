import { IconEye } from '@tabler/icons-react'
import { Badge } from '@/components/Badge/Badge.jsx'
import { IconButton } from '@/components/IconButton/IconButton.jsx'
import { RECORD_STATUS_LABELS, RECORD_STATUS_TONES } from '@/constants/recordStatus.js'

export const buildFamiliesColumns = (onOpen) => [
    { key: 'id', header: 'Nº', sortValue: (row) => row.id, render: (row) => `#${row.id}` },
    { key: 'responsibleName', header: 'Responsável', sortValue: (row) => row.responsibleName },
    { key: 'householdSize', header: 'Integrantes', sortValue: (row) => row.householdSize },
    {
        key: 'neighborhood',
        header: 'Bairro',
        sortValue: (row) => row.neighborhood ?? '',
        render: (row) => row.neighborhood || '—',
    },
    { key: 'phone', header: 'Telefone', noWrap: true, render: (row) => row.phone || '—' },
    {
        key: 'status',
        header: 'Situação',
        sortValue: (row) => RECORD_STATUS_LABELS[row.status],
        render: (row) => (
            <Badge tone={RECORD_STATUS_TONES[row.status]}>{RECORD_STATUS_LABELS[row.status]}</Badge>
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
