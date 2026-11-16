import { Badge } from '@/components/Badge/Badge.jsx'
import { TextLink } from '@/components/TextLink/TextLink.jsx'
import { REQUEST_STATUS_LABELS, REQUEST_STATUS_TONES } from '@/constants/requestStatus.js'
import { formatDateTime } from '@/utils/formatters.js'
import { buildRequestLink } from '@/utils/links.js'

export const FAMILY_REQUESTS_COLUMNS = [
    {
        key: 'id',
        header: 'Nº',
        render: (row) => <TextLink to={buildRequestLink(row.id)}>#{row.id}</TextLink>,
    },
    {
        key: 'createdAt',
        header: 'Criada em',
        noWrap: true,
        render: (row) => formatDateTime(row.createdAt),
    },
    { key: 'requestedBy', header: 'Criada por' },
    { key: 'itemCount', header: 'Itens' },
    {
        key: 'status',
        header: 'Estado',
        render: (row) => (
            <Badge tone={REQUEST_STATUS_TONES[row.status]}>
                {REQUEST_STATUS_LABELS[row.status]}
            </Badge>
        ),
    },
]
