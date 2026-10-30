import { useMemo } from 'react'
import { Badge } from '@/components/Badge/Badge.jsx'
import { Button } from '@/components/Button/Button.jsx'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { RowActions } from '@/components/RowActions/RowActions.jsx'
import { StockLevelBar } from '@/components/StockLevelBar/StockLevelBar.jsx'
import { TextLink } from '@/components/TextLink/TextLink.jsx'
import {
    RECORD_STATUS,
    RECORD_STATUS_LABELS,
    RECORD_STATUS_TONES,
} from '@/constants/recordStatus.js'
import { ROUTES } from '@/constants/routes.js'
import { STOCK_LEVEL_LABELS, STOCK_LEVEL_TONES } from '@/constants/stockLevels.js'
import { UNIT_LABELS } from '@/constants/units.js'
import { formatQuantity } from '@/utils/formatters.js'
import { ItemName, Strong } from './StockTable.styles.js'

const renderStatus = (row) =>
    row.status === RECORD_STATUS.ACTIVE ? (
        <Badge tone={STOCK_LEVEL_TONES[row.level]}>{STOCK_LEVEL_LABELS[row.level]}</Badge>
    ) : (
        <Badge tone={RECORD_STATUS_TONES[row.status]}>{RECORD_STATUS_LABELS[row.status]}</Badge>
    )

const COLUMNS = [
    { key: 'name', header: 'Item', render: (row) => <ItemName>{row.name}</ItemName> },
    { key: 'categoryName', header: 'Categoria' },
    { key: 'unitOfMeasure', header: 'Un.', render: (row) => UNIT_LABELS[row.unitOfMeasure] },
    {
        key: 'physical',
        header: 'Físico',
        align: 'right',
        noWrap: true,
        render: (row) => formatQuantity(row.physical, row.unitOfMeasure),
    },
    {
        key: 'reserved',
        header: 'Reservado',
        align: 'right',
        noWrap: true,
        render: (row) => formatQuantity(row.reserved, row.unitOfMeasure),
    },
    {
        key: 'available',
        header: 'Disponível',
        align: 'right',
        noWrap: true,
        render: (row) => <Strong>{formatQuantity(row.available, row.unitOfMeasure)}</Strong>,
    },
    { key: 'level', header: 'Nível', render: (row) => <StockLevelBar {...row} /> },
    { key: 'status', header: 'Status', render: renderStatus },
]

const buildActionsColumn = (onAdjust) => ({
    key: 'actions',
    header: 'Ações',
    align: 'right',
    render: (row) => (
        <RowActions>
            <TextLink to={`${ROUTES.MOVEMENTS}?itemId=${row.itemId}`}>Histórico</TextLink>
            {onAdjust && row.status === RECORD_STATUS.ACTIVE && (
                <Button
                    variant="text"
                    family="deny"
                    size="sm"
                    onClick={() => onAdjust(row.itemId)}
                    disabled={row.available <= 0}
                >
                    Ajustar
                </Button>
            )}
        </RowActions>
    ),
})

const getRowKey = (row) => row.itemId

const getRowTone = (row) =>
    row.status === RECORD_STATUS.ACTIVE ? STOCK_LEVEL_TONES[row.level] : undefined

export const StockTable = ({ rows, isLoading, error, onRetry, onAdjust }) => {
    const columns = useMemo(() => [...COLUMNS, buildActionsColumn(onAdjust)], [onAdjust])

    return (
        <DataTable
            columns={columns}
            rows={rows}
            getRowKey={getRowKey}
            getRowTone={getRowTone}
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            emptyTitle="Nenhum item encontrado"
            emptyDescription="Ajuste a busca ou os filtros para ver outros itens."
        />
    )
}
