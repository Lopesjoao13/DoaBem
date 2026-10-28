import { Button } from '@/components/Button/Button.jsx'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { StateMessage } from '@/components/StateMessage/StateMessage.jsx'
import { STATE_VARIANTS } from '@/constants/stateMessages.js'
import { useDashboard } from '@/hooks/useDashboard.js'
import { CategoryLevelsChart } from './components/CategoryLevelsChart/CategoryLevelsChart.jsx'
import { CriticalItemsPanel } from './components/CriticalItemsPanel/CriticalItemsPanel.jsx'
import { MonthlyChart } from './components/MonthlyChart/MonthlyChart.jsx'
import { PeriodFilter } from './components/PeriodFilter/PeriodFilter.jsx'
import { RecentMovementsPanel } from './components/RecentMovementsPanel/RecentMovementsPanel.jsx'
import { SummaryCards } from './components/SummaryCards/SummaryCards.jsx'
import { Charts, Content, Lists } from './Dashboard.styles.js'

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

    if (!summary) {
        return (
            <Panel>
                <StateMessage variant={STATE_VARIANTS.LOADING} />
            </Panel>
        )
    }

    return (
        <Content $isRefreshing={isLoading} aria-busy={isLoading}>
            <SummaryCards summary={summary} />
            <Charts>
                <MonthlyChart months={summary.monthly} />
                <CategoryLevelsChart categories={summary.levelsByCategory} />
            </Charts>
            <Lists>
                <CriticalItemsPanel items={summary.topCritical} />
                <RecentMovementsPanel movements={summary.recentMovements} />
            </Lists>
        </Content>
    )
}

const Dashboard = () => {
    const dashboard = useDashboard()

    return (
        <>
            <PageHeader
                title="Dashboard"
                description="Visão geral das doações recebidas, entregas e saldos do estoque."
                actions={
                    <PeriodFilter
                        period={dashboard.period}
                        isLoading={dashboard.isLoading}
                        onFromChange={dashboard.handleFromChange}
                        onToChange={dashboard.handleToChange}
                        onReset={dashboard.resetPeriod}
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

export default Dashboard
