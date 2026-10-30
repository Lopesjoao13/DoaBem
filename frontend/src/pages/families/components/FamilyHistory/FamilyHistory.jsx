import { AsyncContent } from '@/components/AsyncContent/AsyncContent.jsx'
import { DeliveryList } from '@/components/DeliveryHistory/DeliveryHistory.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { StateMessage } from '@/components/StateMessage/StateMessage.jsx'
import { useFamilyHistory } from '@/hooks/useFamilyHistory.js'
import { FamilyRequestsTable } from '../FamilyRequestsTable/FamilyRequestsTable.jsx'

export const FamilyHistory = ({ familyId }) => {
    const { history, error, reload } = useFamilyHistory(familyId)

    return (
        <AsyncContent data={history} error={error} onRetry={reload}>
            {(data) => (
                <>
                    <Panel
                        title="Solicitações"
                        subtitle="Data, estado e responsável"
                        padded={false}
                    >
                        <FamilyRequestsTable requests={data.requests} />
                    </Panel>
                    <Panel title="Entregas" subtitle="Itens efetivamente entregues">
                        {data.deliveries.length > 0 ? (
                            <DeliveryList deliveries={data.deliveries} />
                        ) : (
                            <StateMessage
                                title="Nenhuma entrega"
                                description="As entregas concluídas aparecem aqui."
                            />
                        )}
                    </Panel>
                </>
            )}
        </AsyncContent>
    )
}
