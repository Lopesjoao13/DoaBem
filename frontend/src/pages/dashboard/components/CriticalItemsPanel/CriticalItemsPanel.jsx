import { Badge } from '@/components/Badge/Badge.jsx'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { StockLevelBar } from '@/components/StockLevelBar/StockLevelBar.jsx'
import { ROUTES } from '@/constants/routes.js'
import { STOCK_LEVEL_LABELS, STOCK_LEVEL_TONES } from '@/constants/stockLevels.js'
import { TONES } from '@/constants/tones.js'
import { formatQuantity } from '@/utils/formatters.js'
import { TextLink } from '@/components/TextLink/TextLink.jsx'

const COLUMNS = [
    { key: 'name', header: 'Item' },
    {
        key: 'available',
        header: 'Disponível',
        align: 'right',
        noWrap: true,
        render: (row) => <strong>{formatQuantity(row.available, row.unitOfMeasure)}</strong>,
    },
    { key: 'level', header: 'Nível', render: (row) => <StockLevelBar {...row} /> },
    {
        key: 'status',
        header: 'Status',
        render: (row) => (
            <Badge tone={STOCK_LEVEL_TONES[row.level]}>{STOCK_LEVEL_LABELS[row.level]}</Badge>
        ),
    },
]

const getRowKey = (row) => row.itemId
const getRowTone = () => TONES.CRITICAL

export const CriticalItemsPanel = ({ items }) => (
    <Panel
        title="Itens mais críticos"
        subtitle="Saldo atual · até cinco itens"
        padded={false}
        action={<TextLink to={ROUTES.STOCK}>Ver estoque</TextLink>}
    >
        <DataTable
            columns={COLUMNS}
            rows={items}
            getRowKey={getRowKey}
            getRowTone={getRowTone}
            emptyTitle="Nenhum item crítico"
            emptyDescription="Todos os itens ativos estão acima do estoque mínimo."
        />
    </Panel>
)
