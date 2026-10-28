import { generatePath } from 'react-router-dom'
import { Badge } from '@/components/Badge/Badge.jsx'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { TextLink } from '@/components/TextLink/TextLink.jsx'
import { REQUEST_STATUS_LABELS, REQUEST_STATUS_TONES } from '@/constants/requestStatus.js'
import { ROUTES } from '@/constants/routes.js'
import { formatDateTime } from '@/utils/formatters.js'

const COLUMNS = [
    {
        key: 'id',
        header: 'Nº',
        render: (row) => (
            <TextLink to={generatePath(ROUTES.REQUEST_DETAIL, { id: row.id })}>#{row.id}</TextLink>
        ),
    },
    {
        key: 'createdAt',
        header: 'Criada em',
        noWrap: true,
        render: (row) => formatDateTime(row.createdAt),
    },
    { key: 'requestedBy', header: 'Criada por' },
    { key: 'itemCount', header: 'Itens', align: 'right' },
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

export const FamilyRequestsTable = ({ requests }) => (
    <DataTable
        columns={COLUMNS}
        rows={requests}
        emptyTitle="Nenhuma solicitação"
        emptyDescription="As solicitações desta família aparecem aqui."
    />
)
