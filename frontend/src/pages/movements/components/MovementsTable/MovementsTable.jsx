import { Badge } from '@/components/Badge/Badge.jsx'
import { Button } from '@/components/Button/Button.jsx'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPE_TONES } from '@/constants/movementTypes.js'
import { TONES } from '@/constants/tones.js'
import { formatDateTime, formatQuantity } from '@/utils/formatters.js'
import { MovementReference } from '../MovementReference/MovementReference.jsx'
import { TypeCell } from './MovementsTable.styles.js'

const buildColumns = (onOpen) => [
    { key: 'id', header: 'Nº', render: (row) => `#${row.id}` },
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
            <TypeCell>
                <Badge tone={MOVEMENT_TYPE_TONES[row.type]}>{MOVEMENT_TYPE_LABELS[row.type]}</Badge>
                {row.reversedById && (
                    <Badge tone={TONES.NEUTRAL}>Estornado por #{row.reversedById}</Badge>
                )}
            </TypeCell>
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
    {
        key: 'reference',
        header: 'Referência',
        render: (row) => <MovementReference reference={row.reference} />,
    },
    { key: 'userName', header: 'Responsável' },
    {
        key: 'actions',
        header: 'Ações',
        align: 'right',
        render: (row) => (
            <Button variant="text" size="sm" onClick={() => onOpen(row.id)}>
                Detalhe
            </Button>
        ),
    },
]

export const MovementsTable = ({ rows, isLoading, error, onRetry, onOpen }) => (
    <DataTable
        columns={buildColumns(onOpen)}
        rows={rows}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        emptyTitle="Nenhuma movimentação encontrada"
        emptyDescription="Ajuste o período ou os filtros."
    />
)
