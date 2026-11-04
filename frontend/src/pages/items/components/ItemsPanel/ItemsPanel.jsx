import { Badge } from '@/components/Badge/Badge.jsx'
import { Button } from '@/components/Button/Button.jsx'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { FilterChips } from '@/components/FilterChips/FilterChips.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { RowActions } from '@/components/RowActions/RowActions.jsx'
import {
    RECORD_STATUS,
    RECORD_STATUS_LABELS,
    RECORD_STATUS_TONES,
} from '@/constants/recordStatus.js'
import { STATUS_FILTER_OPTIONS } from '@/constants/stockFilters.js'
import { UNIT_LABELS } from '@/constants/units.js'
import { formatQuantity } from '@/utils/formatters.js'

const BASE_COLUMNS = [
    { key: 'name', header: 'Item' },
    { key: 'categoryName', header: 'Categoria' },
    { key: 'unitOfMeasure', header: 'Unidade', render: (row) => UNIT_LABELS[row.unitOfMeasure] },
    {
        key: 'minStock',
        header: 'Estoque mínimo',
        align: 'right',
        noWrap: true,
        render: (row) => formatQuantity(row.minStock, row.unitOfMeasure),
    },
    {
        key: 'status',
        header: 'Situação',
        render: (row) => (
            <Badge tone={RECORD_STATUS_TONES[row.status]}>{RECORD_STATUS_LABELS[row.status]}</Badge>
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
                        family={row.status === RECORD_STATUS.ACTIVE ? 'deny' : 'confirm'}
                        onClick={() => onToggleStatus(row)}
                    >
                        {row.status === RECORD_STATUS.ACTIVE ? 'Inativar' : 'Reativar'}
                    </Button>
                </RowActions>
            ),
        },
    ]
}

export const ItemsPanel = ({ catalog, onEdit, onToggleStatus }) => (
    <Panel
        title="Itens"
        subtitle="Filtre por situação"
        padded={false}
        action={
            <FilterChips
                label="Filtrar itens por situação"
                options={STATUS_FILTER_OPTIONS}
                value={catalog.itemStatus}
                onChange={catalog.changeItemStatus}
            />
        }
    >
        <DataTable
            columns={buildColumns(onEdit, onToggleStatus)}
            rows={catalog.items}
            isLoading={catalog.isLoadingItems}
            error={catalog.itemsError}
            onRetry={catalog.reloadItems}
            emptyTitle="Nenhum item nesta situação"
            emptyDescription="Cadastre itens para controlar o estoque."
        />
    </Panel>
)
