import { IconBan, IconCircleCheck, IconPencil } from '@tabler/icons-react'
import { Badge } from '@/components/Badge/Badge.jsx'
import { IconButton } from '@/components/IconButton/IconButton.jsx'
import { RowActions } from '@/components/RowActions/RowActions.jsx'
import {
    RECORD_STATUS,
    RECORD_STATUS_LABELS,
    RECORD_STATUS_TONES,
} from '@/constants/recordStatus.js'
import { UNIT_LABELS } from '@/constants/units.js'
import { formatQuantity } from '@/utils/formatters.js'

export const ITEM_BASE_COLUMNS = [
    { key: 'name', header: 'Item', sortValue: (row) => row.name },
    { key: 'categoryName', header: 'Categoria', sortValue: (row) => row.categoryName },
    {
        key: 'unitOfMeasure',
        header: 'Unidade',
        sortValue: (row) => UNIT_LABELS[row.unitOfMeasure],
        render: (row) => UNIT_LABELS[row.unitOfMeasure],
    },
    {
        key: 'minStock',
        header: 'Estoque mínimo',
        noWrap: true,
        sortValue: (row) => row.minStock,
        render: (row) => formatQuantity(row.minStock, row.unitOfMeasure),
    },
    {
        key: 'status',
        header: 'Situação',
        sortValue: (row) => RECORD_STATUS_LABELS[row.status],
        render: (row) => (
            <Badge tone={RECORD_STATUS_TONES[row.status]}>{RECORD_STATUS_LABELS[row.status]}</Badge>
        ),
    },
]
export const buildItemsColumns = (onEdit, onToggleStatus) => {
    if (!onEdit) return ITEM_BASE_COLUMNS
    return [
        ...ITEM_BASE_COLUMNS,
        {
            key: 'actions',
            header: 'Ações',
            render: (row) => (
                <RowActions>
                    <IconButton icon={IconPencil} label="Editar" onClick={() => onEdit(row)} />
                    <IconButton
                        icon={row.status === RECORD_STATUS.ACTIVE ? IconBan : IconCircleCheck}
                        label={row.status === RECORD_STATUS.ACTIVE ? 'Inativar' : 'Reativar'}
                        tone={row.status === RECORD_STATUS.ACTIVE ? 'deny' : 'confirm'}
                        onClick={() => onToggleStatus(row)}
                    />
                </RowActions>
            ),
        },
    ]
}
