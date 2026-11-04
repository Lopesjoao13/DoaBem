import { IconPlus } from '@tabler/icons-react'
import { generatePath, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/Badge/Badge.jsx'
import { Button } from '@/components/Button/Button.jsx'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { FilterChips } from '@/components/FilterChips/FilterChips.jsx'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { TextLink } from '@/components/TextLink/TextLink.jsx'
import {
    REQUEST_STATUS_LABELS,
    REQUEST_STATUS_TONES,
    REQUEST_TABS,
} from '@/constants/requestStatus.js'
import { ROUTES } from '@/constants/routes.js'
import { useRequests } from '@/hooks/useRequests.js'
import { formatDate } from '@/utils/formatters.js'

const COLUMNS = [
    { key: 'id', header: 'Nº', render: (row) => `#${row.id}` },
    { key: 'createdAt', header: 'Data', noWrap: true, render: (row) => formatDate(row.createdAt) },
    { key: 'beneficiaryName', header: 'Família' },
    { key: 'itemCount', header: 'Itens', align: 'right' },
    { key: 'requestedBy', header: 'Criada por' },
    {
        key: 'status',
        header: 'Estado',
        render: (row) => (
            <Badge tone={REQUEST_STATUS_TONES[row.status]}>
                {REQUEST_STATUS_LABELS[row.status]}
            </Badge>
        ),
    },
    {
        key: 'actions',
        header: 'Ações',
        align: 'right',
        render: (row) => (
            <TextLink to={generatePath(ROUTES.REQUEST_DETAIL, { id: row.id })}>Abrir</TextLink>
        ),
    },
]

const RequestsPage = () => {
    const navigate = useNavigate()
    const requests = useRequests()

    return (
        <>
            <PageHeader
                title="Solicitações"
                description="Pedidos das famílias: análise, separação com reserva e entrega."
                actions={
                    <Button onClick={() => navigate(ROUTES.REQUEST_NEW)}>
                        <IconPlus size={18} stroke={2} />
                        Nova solicitação
                    </Button>
                }
            />
            <FilterChips
                label="Filtrar por estado"
                options={REQUEST_TABS}
                value={requests.tab}
                counts={requests.counts}
                onChange={requests.changeTab}
            />
            <Panel padded={false}>
                <DataTable
                    columns={COLUMNS}
                    rows={requests.requests}
                    isLoading={requests.isLoading}
                    error={requests.error}
                    onRetry={requests.reload}
                    emptyTitle="Nenhuma solicitação neste estado"
                    emptyDescription="Troque o filtro ou crie uma nova solicitação."
                />
            </Panel>
        </>
    )
}

export default RequestsPage
