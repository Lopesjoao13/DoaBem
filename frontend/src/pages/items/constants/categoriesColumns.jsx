import { IconBan, IconCircleCheck, IconPencil } from '@tabler/icons-react'
import { Badge } from '@/components/Badge/Badge.jsx'
import { IconButton } from '@/components/IconButton/IconButton.jsx'
import { RowActions } from '@/components/RowActions/RowActions.jsx'
import {
    RECORD_STATUS,
    RECORD_STATUS_LABELS,
    RECORD_STATUS_TONES,
} from '@/constants/recordStatus.js'

export const toCategoryStatus = (active) => (active ? RECORD_STATUS.ACTIVE : RECORD_STATUS.INACTIVE)
export const CATEGORY_BASE_COLUMNS = [
    { key: 'name', header: 'Categoria', sortValue: (row) => row.name },
    { key: 'description', header: 'Descrição', render: (row) => row.description || '—' },
    {
        key: 'active',
        header: 'Situação',
        render: (row) => (
            <Badge tone={RECORD_STATUS_TONES[toCategoryStatus(row.active)]}>
                {RECORD_STATUS_LABELS[toCategoryStatus(row.active)]}
            </Badge>
        ),
    },
]
export const buildCategoriesColumns = (onEdit, onToggleStatus) => {
    if (!onEdit) return CATEGORY_BASE_COLUMNS
    return [
        ...CATEGORY_BASE_COLUMNS,
        {
            key: 'actions',
            header: 'Ações',
            render: (row) => (
                <RowActions>
                    <IconButton icon={IconPencil} label="Editar" onClick={() => onEdit(row)} />
                    <IconButton
                        icon={row.active ? IconBan : IconCircleCheck}
                        label={row.active ? 'Inativar' : 'Reativar'}
                        tone={row.active ? 'deny' : 'confirm'}
                        onClick={() => onToggleStatus(row)}
                    />
                </RowActions>
            ),
        },
    ]
}
