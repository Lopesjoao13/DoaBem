import { Button } from '@/components/Button/Button.jsx'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { StateMessage } from '@/components/StateMessage/StateMessage.jsx'
import { STATE_VARIANTS } from '@/constants/stateMessages.js'
import { useDashboard } from '@/pages/dashboard/hooks/useDashboard.js'
import { AttentionPanel } from '@/pages/dashboard/components/AttentionPanel/AttentionPanel.jsx'
import { CategoryDonut } from '@/pages/dashboard/components/CategoryDonut/CategoryDonut.jsx'
import { DashboardSkeleton } from '@/pages/dashboard/components/DashboardSkeleton/DashboardSkeleton.jsx'
import { MonthlyChart } from '@/pages/dashboard/components/MonthlyChart/MonthlyChart.jsx'
import { MovementsTimeline } from '@/pages/dashboard/components/MovementsTimeline/MovementsTimeline.jsx'
import { PeriodFilter } from '@/pages/dashboard/components/PeriodFilter/PeriodFilter.jsx'
import { SummaryCards } from '@/pages/dashboard/components/SummaryCards/SummaryCards.jsx'
import { Charts, Content, Lists } from './DashboardPage.styles.js'

const DashboardContent = ({ summary, error, isLoading, onRetry }) => {
    if (error) {
        return (
            <Panel>
                <StateMessage
                    variant={STATE_VARIANTS.ERROR}
                    description={error}
                    action={
                        <Button variant="outline" onClick={onRetry}>
                            Tentar novamente
                        </Button>
                    }
                />
            </Panel>
        )
    }

    if (!summary) return <DashboardSkeleton />

    return (
        <Content $isRefreshing={isLoading} aria-busy={isLoading}>
            <SummaryCards summary={summary} />
            <Charts>
                <MonthlyChart months={summary.monthly} />
                <CategoryDonut categories={summary.balanceByCategory} />
            </Charts>
            <Lists>
                <AttentionPanel
                    criticalItems={summary.topCritical}
                    pendingRequests={summary.pendingList}
                    onChanged={onRetry}
                />
                <MovementsTimeline movements={summary.recentMovements} />
            </Lists>
        </Content>
    )
}

const DashboardPage = () => {
    const dashboard = useDashboard()

    return (
        <>
            <PageHeader
                title="Dashboard"
                description="Visão geral das doações recebidas, entregas e saldos do estoque."
                actions={
                    <PeriodFilter
                        period={dashboard.period}
                        preset={dashboard.preset}
                        generatedAt={dashboard.summary?.generatedAt}
                        isLoading={dashboard.isLoading}
                        onPresetChange={dashboard.selectPreset}
                        onFromChange={dashboard.handleFromChange}
                        onToChange={dashboard.handleToChange}
                        onRefresh={dashboard.reload}
                    />
                }
            />
            <DashboardContent
                summary={dashboard.summary}
                error={dashboard.error}
                isLoading={dashboard.isLoading}
                onRetry={dashboard.reload}
            />
        </>
    )
}

export default DashboardPage
