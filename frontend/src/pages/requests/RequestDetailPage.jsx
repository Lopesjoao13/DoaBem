import { generatePath, useParams } from 'react-router-dom'
import { AsyncContent } from '@/components/AsyncContent/AsyncContent.jsx'
import { BackLink } from '@/components/BackLink/BackLink.jsx'
import { Badge } from '@/components/Badge/Badge.jsx'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { RecentDeliveriesNotice } from '@/components/DeliveryHistory/DeliveryHistory.jsx'
import { DescriptionList } from '@/components/DescriptionList/DescriptionList.jsx'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { TextLink } from '@/components/TextLink/TextLink.jsx'
import { REQUEST_DIALOGS } from '@/constants/requestActions.js'
import { REQUEST_MESSAGES } from '@/constants/requestMessages.js'
import {
    REQUEST_STATUS,
    REQUEST_STATUS_LABELS,
    REQUEST_STATUS_TONES,
} from '@/constants/requestStatus.js'
import { ROUTES } from '@/constants/routes.js'
import { TONES } from '@/constants/tones.js'
import { useDisclosure } from '@/hooks/useDisclosure.js'
import { useRequestDetail } from '@/hooks/useRequestDetail.js'
import { CancelDialog } from './components/CancelDialog/CancelDialog.jsx'
import { DecisionDialog } from './components/DecisionDialog/DecisionDialog.jsx'
import { DeliverDialog } from './components/DeliverDialog/DeliverDialog.jsx'
import { DeliveryReceipt } from './components/DeliveryReceipt/DeliveryReceipt.jsx'
import { PickDialog } from './components/PickDialog/PickDialog.jsx'
import { RequestItemsTable } from './components/RequestItemsTable/RequestItemsTable.jsx'
import { RequestTimeline } from './components/RequestTimeline/RequestTimeline.jsx'
import { Columns, Side } from './RequestDetailPage.styles.js'

const OPEN_STATUSES = [REQUEST_STATUS.PENDING, REQUEST_STATUS.APPROVED]

const DIALOGS = {
    [REQUEST_DIALOGS.DECIDE]: DecisionDialog,
    [REQUEST_DIALOGS.PICK]: PickDialog,
    [REQUEST_DIALOGS.DELIVER]: DeliverDialog,
    [REQUEST_DIALOGS.CANCEL]: CancelDialog,
}

const RequestActions = ({ actions, onOpen }) => (
    <>
        {actions.canCancel && (
            <Button variant="outline" family="deny" onClick={() => onOpen(REQUEST_DIALOGS.CANCEL)}>
                Cancelar
            </Button>
        )}
        {actions.canDecide && (
            <Button onClick={() => onOpen(REQUEST_DIALOGS.DECIDE)}>Analisar</Button>
        )}
        {actions.canPick && (
            <Button onClick={() => onOpen(REQUEST_DIALOGS.PICK)}>Separar itens</Button>
        )}
        {actions.canDeliver && (
            <Button family="confirm" onClick={() => onOpen(REQUEST_DIALOGS.DELIVER)}>
                Confirmar entrega
            </Button>
        )}
    </>
)

const RequestDetailPage = () => {
    const { id } = useParams()
    const { request, error, reload, actions } = useRequestDetail(id)
    const dialog = useDisclosure()
    const ActiveDialog = dialog.isOpen ? DIALOGS[dialog.payload] : null

    const handleDone = () => {
        dialog.close()
        reload()
    }

    return (
        <>
            <BackLink to={ROUTES.REQUESTS}>Voltar para solicitações</BackLink>
            <AsyncContent data={request} error={error} onRetry={reload}>
                {(data) => (
                    <>
                        <PageHeader
                            title={
                                <>
                                    Solicitação #{data.id}{' '}
                                    <Badge tone={REQUEST_STATUS_TONES[data.status]}>
                                        {REQUEST_STATUS_LABELS[data.status]}
                                    </Badge>
                                </>
                            }
                            description={`${data.beneficiaryName} · criada por ${data.requestedBy}`}
                            actions={<RequestActions actions={actions} onOpen={dialog.open} />}
                        />
                        {actions.isAwaitingDecision && (
                            <Callout tone={TONES.WARNING}>
                                {REQUEST_MESSAGES.awaitingDecision}
                            </Callout>
                        )}
                        {data.status === REQUEST_STATUS.APPROVED && (
                            <Callout tone={TONES.INFO}>{REQUEST_MESSAGES.pickNotice}</Callout>
                        )}
                        <Columns>
                            <Panel title="Itens" subtitle="Solicitado × aprovado" padded={false}>
                                <RequestItemsTable request={data} />
                            </Panel>
                            <Side>
                                <Panel
                                    title="Família"
                                    action={
                                        <TextLink
                                            to={generatePath(ROUTES.FAMILY_DETAIL, {
                                                id: data.beneficiary.id,
                                            })}
                                        >
                                            Ver histórico
                                        </TextLink>
                                    }
                                >
                                    <DescriptionList
                                        items={[
                                            {
                                                label: 'Responsável',
                                                value: data.beneficiary.responsibleName,
                                            },
                                            {
                                                label: 'Integrantes',
                                                value: String(data.beneficiary.householdSize),
                                            },
                                            {
                                                label: 'Bairro',
                                                value: data.beneficiary.neighborhood,
                                            },
                                        ]}
                                    />
                                </Panel>
                                {OPEN_STATUSES.includes(data.status) && (
                                    <RecentDeliveriesNotice summary={data.familyHistory} />
                                )}
                                <Panel title="Histórico da solicitação">
                                    <RequestTimeline request={data} />
                                </Panel>
                            </Side>
                        </Columns>
                        {data.delivery && <DeliveryReceipt request={data} />}
                        {ActiveDialog && (
                            <ActiveDialog
                                request={data}
                                onClose={dialog.close}
                                onDone={handleDone}
                            />
                        )}
                    </>
                )}
            </AsyncContent>
        </>
    )
}

export default RequestDetailPage
