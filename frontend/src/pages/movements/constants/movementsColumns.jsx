import { IconEye } from '@tabler/icons-react'
import { Badge } from '@/components/Badge/Badge.jsx'
import { IconButton } from '@/components/IconButton/IconButton.jsx'
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPE_TONES } from '@/constants/movementTypes.js'
import { TONES } from '@/constants/tones.js'
import { formatDateTime, formatQuantity } from '@/utils/formatters.js'
import { MovementReference } from '@/pages/movements/components/MovementReference/MovementReference.jsx'
import { TypeCell } from '@/pages/movements/components/MovementsTable/MovementsTable.styles.js'

export const buildMovementsColumns = (onOpen) => [
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
        render: (row) => (
            <IconButton icon={IconEye} label="Ver detalhe" onClick={() => onOpen(row.id)} />
        ),
    },
]
