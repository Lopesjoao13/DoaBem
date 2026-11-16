import { Panel } from '@/components/Panel/Panel.jsx'
import { Skeleton } from '@/components/Skeleton/Skeleton.jsx'
import { Block, Cards } from './DashboardSkeleton.styles.js'

export const DashboardSkeleton = () => (
    <div role="status" aria-label="Carregando painel">
        <Block>
            <Cards $columns={2}>
                {[0, 1].map((key) => (
                    <Panel key={key}>
                        <Skeleton width="40%" height={14} />
                        <Skeleton width="24%" height={32} />
                        <Skeleton width="60%" height={14} />
                    </Panel>
                ))}
            </Cards>
            <Cards $columns={3}>
                {[0, 1, 2].map((key) => (
                    <Panel key={key}>
                        <Skeleton width="50%" height={14} />
                        <Skeleton width="30%" height={32} />
                    </Panel>
                ))}
            </Cards>
            <Cards $columns={2}>
                {[0, 1].map((key) => (
                    <Panel key={key}>
                        <Skeleton height={220} />
                    </Panel>
                ))}
            </Cards>
        </Block>
    </div>
)
