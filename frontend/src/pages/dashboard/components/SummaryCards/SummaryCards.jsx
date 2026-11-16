import {
    IconAlertTriangle,
    IconClipboardList,
    IconDownload,
    IconPackage,
    IconTruckDelivery,
} from '@tabler/icons-react'
import { STOCK_LEVEL_PARAM } from '@/pages/dashboard/constants/dashboard.js'
import { ROUTES } from '@/constants/routes.js'
import { STOCK_LEVELS } from '@/constants/stockLevels.js'
import { TONES } from '@/constants/tones.js'
import { KpiCard } from '@/pages/dashboard/components/KpiCard/KpiCard.jsx'
import { AttentionGrid, VolumeGrid } from './SummaryCards.styles.js'

const pluralize = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`

export const SummaryCards = ({ summary }) => (
    <>
        <AttentionGrid aria-label="Pendências">
            <KpiCard
                isHighlighted
                label="Itens críticos"
                value={summary.criticalItems}
                hint="Disponível no ou abaixo do mínimo"
                icon={IconAlertTriangle}
                tone={summary.criticalItems > 0 ? TONES.CRITICAL : TONES.NEUTRAL}
                to={`${ROUTES.STOCK}?${STOCK_LEVEL_PARAM}=${STOCK_LEVELS.CRITICAL}`}
                linkLabel="Ver no estoque"
            />
            <KpiCard
                isHighlighted
                label="Solicitações pendentes"
                value={summary.pendingRequests}
                hint="Aguardando análise"
                icon={IconClipboardList}
                tone={summary.pendingRequests > 0 ? TONES.WARNING : TONES.NEUTRAL}
                to={ROUTES.REQUESTS}
                linkLabel="Analisar solicitações"
            />
        </AttentionGrid>
        <VolumeGrid aria-label="Volume">
            <KpiCard
                label="Itens ativos"
                value={summary.activeItems}
                hint={pluralize(summary.activeCategories, 'categoria ativa', 'categorias ativas')}
                icon={IconPackage}
                to={ROUTES.STOCK}
            />
            <KpiCard
                label="Entradas no período"
                value={summary.entriesInPeriod}
                hint="Doações registradas"
                icon={IconDownload}
                comparison={{
                    current: summary.entriesInPeriod,
                    previous: summary.previous.entries,
                }}
                to={ROUTES.ENTRIES}
            />
            <KpiCard
                label="Entregas no período"
                value={summary.deliveriesInPeriod}
                hint="Solicitações entregues"
                icon={IconTruckDelivery}
                comparison={{
                    current: summary.deliveriesInPeriod,
                    previous: summary.previous.deliveries,
                }}
                to={ROUTES.MOVEMENTS}
            />
        </VolumeGrid>
    </>
)
