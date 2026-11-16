import { AsyncContent } from '@/components/AsyncContent/AsyncContent.jsx'
import { DeliveryList } from '@/components/DeliveryHistory/DeliveryHistory.jsx'
import { FormSection } from '@/components/FormSection/FormSection.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { StateMessage } from '@/components/StateMessage/StateMessage.jsx'
import { Stack } from '@/components/Stack/Stack.jsx'
import { useFamilyHistory } from '@/pages/families/hooks/useFamilyHistory.js'
import { FamilyRequestsTable } from '@/pages/families/components/FamilyRequestsTable/FamilyRequestsTable.jsx'

export const FamilyHistory = ({ familyId }) => {
    const { history, error, reload } = useFamilyHistory(familyId)

    return (
        <AsyncContent data={history} error={error} onRetry={reload}>
            {(data) => (
                <Stack gap={32}>
                    <FormSection title="Solicitações" subtitle="Data, estado e responsável">
                        <Panel padded={false}>
                            <FamilyRequestsTable requests={data.requests} />
                        </Panel>
                    </FormSection>
                    <FormSection title="Entregas" subtitle="Itens efetivamente entregues">
                        {data.deliveries.length > 0 ? (
                            <DeliveryList deliveries={data.deliveries} />
                        ) : (
                            <StateMessage
                                title="Nenhuma entrega"
                                description="As entregas concluídas aparecem aqui."
                            />
                        )}
                    </FormSection>
                </Stack>
            )}
        </AsyncContent>
    )
}
