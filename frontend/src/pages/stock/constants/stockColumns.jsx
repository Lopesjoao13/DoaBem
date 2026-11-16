import { IconAdjustmentsHorizontal, IconHistory } from '@tabler/icons-react'
import { Badge } from '@/components/Badge/Badge.jsx'
import { IconButton } from '@/components/IconButton/IconButton.jsx'
import { RowActions } from '@/components/RowActions/RowActions.jsx'
import { StockLevelBar } from '@/components/StockLevelBar/StockLevelBar.jsx'
import {
    RECORD_STATUS,
    RECORD_STATUS_LABELS,
    RECORD_STATUS_TONES,
} from '@/constants/recordStatus.js'
import { ROUTES } from '@/constants/routes.js'
import { STOCK_LEVEL_LABELS, STOCK_LEVEL_TONES } from '@/constants/stockLevels.js'
import { UNIT_LABELS } from '@/constants/units.js'
import { formatQuantity } from '@/utils/formatters.js'
import { ItemName, Strong } from '@/pages/stock/components/StockTable/StockTable.styles.js'

export const renderStatus = (row) =>
    row.status === RECORD_STATUS.ACTIVE ? (
        <Badge tone={STOCK_LEVEL_TONES[row.level]}>{STOCK_LEVEL_LABELS[row.level]}</Badge>
    ) : (
        <Badge tone={RECORD_STATUS_TONES[row.status]}>{RECORD_STATUS_LABELS[row.status]}</Badge>
    )

export const STOCK_COLUMNS = [
    {
        key: 'name',
        header: 'Item',
        sortValue: (row) => row.name,
        render: (row) => <ItemName>{row.name}</ItemName>,
    },
    {
        key: 'categoryName',
        header: 'Categoria',
        sortValue: (row) => row.categoryName,
    },
    {
        key: 'unitOfMeasure',
        header: 'Un.',
        sortValue: (row) => UNIT_LABELS[row.unitOfMeasure],
        render: (row) => UNIT_LABELS[row.unitOfMeasure],
    },
    {
        key: 'physical',
        sortValue: (row) => row.physical,
        header: 'Físico',
        noWrap: true,
        render: (row) => formatQuantity(row.physical, row.unitOfMeasure),
    },
    {
        key: 'reserved',
        sortValue: (row) => row.reserved,
        header: 'Reservado',
        noWrap: true,
        render: (row) => formatQuantity(row.reserved, row.unitOfMeasure),
    },
    {
        key: 'available',
        sortValue: (row) => row.available,
        header: 'Disponível',
        noWrap: true,
        render: (row) => <Strong>{formatQuantity(row.available, row.unitOfMeasure)}</Strong>,
    },
    {
        key: 'level',
        header: 'Nível',
        sortValue: (row) => row.available / Math.max(row.minStock, 1),
        render: (row) => <StockLevelBar {...row} />,
    },
    {
        key: 'status',
        header: 'Status',
        sortValue: (row) => STOCK_LEVEL_LABELS[row.level] ?? '',
        render: renderStatus,
    },
]
export const buildStockActionsColumn = (onAdjust) => ({
    key: 'actions',
    header: 'Ações',
    render: (row) => (
        <RowActions>
            <IconButton
                icon={IconHistory}
                label="Histórico"
                to={`${ROUTES.MOVEMENTS}?itemId=${row.itemId}`}
            />
            {onAdjust && row.status === RECORD_STATUS.ACTIVE && (
                <IconButton
                    icon={IconAdjustmentsHorizontal}
                    label="Ajustar saldo"
                    onClick={() => onAdjust(row.itemId)}
                    disabled={row.available <= 0}
                />
            )}
        </RowActions>
    ),
})
export const getStockRowKey = (row) => row.itemId
