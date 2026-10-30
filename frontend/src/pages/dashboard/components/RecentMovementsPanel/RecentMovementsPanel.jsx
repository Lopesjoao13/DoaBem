import { Badge } from '@/components/Badge/Badge.jsx'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPE_TONES } from '@/constants/movementTypes.js'
import { ROUTES } from '@/constants/routes.js'
import { formatDateTime, formatQuantity } from '@/utils/formatters.js'
import { TextLink } from '@/components/TextLink/TextLink.jsx'

const COLUMNS = [
    {
        key: 'occurredAt',
        header: 'Data/hora',
        noWrap: true,
        render: (row) => formatDateTime(row.occurredAt),
    },
    {
        key: 'type',
        header: 'Tipo',
        render: (row) => (
            <Badge tone={MOVEMENT_TYPE_TONES[row.type]}>{MOVEMENT_TYPE_LABELS[row.type]}</Badge>
        ),
    },
    { key: 'itemName', header: 'Item' },
    {
        key: 'quantity',
        header: 'Qtd.',
        align: 'right',
        noWrap: true,
        render: (row) => formatQuantity(row.quantity, row.unitOfMeasure),
    },
    { key: 'userName', header: 'Responsável' },
]

export const RecentMovementsPanel = ({ movements }) => (
    <Panel
        title="Últimas movimentações"
        subtitle="Entradas, entregas, ajustes e estornos"
        padded={false}
        action={<TextLink to={ROUTES.MOVEMENTS}>Ver histórico</TextLink>}
    >
        <DataTable
            columns={COLUMNS}
            rows={movements}
            emptyTitle="Nenhuma movimentação"
            emptyDescription="As entradas e entregas registradas aparecem aqui."
        />
    </Panel>
)
