import {
    IconAlertTriangle,
    IconClipboardList,
    IconDownload,
    IconPackage,
    IconTruckDelivery,
} from '@tabler/icons-react'
import { CARD_SCOPES } from '@/constants/dashboard.js'
import { TONES } from '@/constants/tones.js'
import { StatCard } from '../StatCard/StatCard.jsx'
import { Grid } from './SummaryCards.styles.js'

const pluralize = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`

export const SummaryCards = ({ summary }) => (
    <Grid>
        <StatCard
            label="Itens ativos"
            value={summary.activeItems}
            hint={pluralize(summary.activeCategories, 'categoria ativa', 'categorias ativas')}
            scope={CARD_SCOPES.CURRENT}
            icon={IconPackage}
        />
        <StatCard
            label="Itens críticos"
            value={summary.criticalItems}
            hint="Disponível no ou abaixo do mínimo"
            scope={CARD_SCOPES.CURRENT}
            icon={IconAlertTriangle}
            tone={summary.criticalItems > 0 ? TONES.CRITICAL : TONES.NEUTRAL}
        />
        <StatCard
            label="Entradas"
            value={summary.entriesInPeriod}
            hint="Doações registradas"
            scope={CARD_SCOPES.PERIOD}
            icon={IconDownload}
        />
        <StatCard
            label="Entregas concluídas"
            value={summary.deliveriesInPeriod}
            hint="Solicitações entregues"
            scope={CARD_SCOPES.PERIOD}
            icon={IconTruckDelivery}
        />
        <StatCard
            label="Solicitações pendentes"
            value={summary.pendingRequests}
            hint="Aguardando análise"
            scope={CARD_SCOPES.CURRENT}
            icon={IconClipboardList}
            tone={summary.pendingRequests > 0 ? TONES.WARNING : TONES.NEUTRAL}
        />
    </Grid>
)
