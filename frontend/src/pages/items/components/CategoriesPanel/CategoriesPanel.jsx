import { Badge } from '@/components/Badge/Badge.jsx'
import { Button } from '@/components/Button/Button.jsx'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { RowActions } from '@/components/RowActions/RowActions.jsx'
import {
    RECORD_STATUS,
    RECORD_STATUS_LABELS,
    RECORD_STATUS_TONES,
} from '@/constants/recordStatus.js'

const toStatus = (active) => (active ? RECORD_STATUS.ACTIVE : RECORD_STATUS.INACTIVE)

const BASE_COLUMNS = [
    { key: 'name', header: 'Categoria' },
    { key: 'description', header: 'Descrição', render: (row) => row.description || '—' },
    {
        key: 'active',
        header: 'Situação',
        render: (row) => (
            <Badge tone={RECORD_STATUS_TONES[toStatus(row.active)]}>
                {RECORD_STATUS_LABELS[toStatus(row.active)]}
            </Badge>
        ),
    },
]

const buildColumns = (onEdit, onToggleStatus) => {
    if (!onEdit) return BASE_COLUMNS
    return [
        ...BASE_COLUMNS,
        {
            key: 'actions',
            header: 'Ações',
            align: 'right',
            render: (row) => (
                <RowActions>
                    <Button variant="text" size="sm" onClick={() => onEdit(row)}>
                        Editar
                    </Button>
                    <Button
                        variant="text"
                        size="sm"
                        family={row.active ? 'deny' : 'confirm'}
                        onClick={() => onToggleStatus(row)}
                    >
                        {row.active ? 'Inativar' : 'Reativar'}
                    </Button>
                </RowActions>
            ),
        },
    ]
}

export const CategoriesPanel = ({ catalog, onEdit, onToggleStatus }) => (
    <Panel title="Categorias" padded={false}>
        <DataTable
            columns={buildColumns(onEdit, onToggleStatus)}
            rows={catalog.categories}
            isLoading={catalog.isLoadingCategories}
            error={catalog.categoriesError}
            onRetry={catalog.reloadCategories}
            emptyTitle="Nenhuma categoria"
            emptyDescription="Cadastre categorias para organizar os itens."
        />
    </Panel>
)
