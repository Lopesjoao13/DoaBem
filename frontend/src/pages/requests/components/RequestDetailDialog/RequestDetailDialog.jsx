import { AsyncContent } from '@/components/AsyncContent/AsyncContent.jsx'
import { Badge } from '@/components/Badge/Badge.jsx'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { RecentDeliveriesNotice } from '@/components/DeliveryHistory/DeliveryHistory.jsx'
import { DescriptionList } from '@/components/DescriptionList/DescriptionList.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { FormSection } from '@/components/FormSection/FormSection.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { Stack } from '@/components/Stack/Stack.jsx'
import { TextLink } from '@/components/TextLink/TextLink.jsx'
import { DIALOG_KINDS, DIALOG_SIZES } from '@/constants/dialog.js'
import { REQUEST_DIALOGS } from '@/constants/requestActions.js'
import { REQUEST_MESSAGES } from '@/constants/requestMessages.js'
import {
    REQUEST_STATUS,
    REQUEST_STATUS_LABELS,
    REQUEST_STATUS_TONES,
} from '@/constants/requestStatus.js'
import { buildFamilyLink } from '@/utils/links.js'
import { TONES } from '@/constants/tones.js'
import { useDisclosure } from '@/hooks/useDisclosure.js'
import { useRequestDetail } from '@/pages/requests/hooks/useRequestDetail.js'
import { CancelDialog } from '@/pages/requests/components/CancelDialog/CancelDialog.jsx'
import { DecisionDialog } from '@/pages/requests/components/DecisionDialog/DecisionDialog.jsx'
import { DeliverDialog } from '@/pages/requests/components/DeliverDialog/DeliverDialog.jsx'
import { DeliveryReceipt } from '@/pages/requests/components/DeliveryReceipt/DeliveryReceipt.jsx'
import { PickDialog } from '@/pages/requests/components/PickDialog/PickDialog.jsx'
import { RequestItemsTable } from '@/pages/requests/components/RequestItemsTable/RequestItemsTable.jsx'
import { RequestTimeline } from '@/pages/requests/components/RequestTimeline/RequestTimeline.jsx'
import { OPEN_STATUSES } from '@/pages/requests/constants/requestOptions.js'

const DIALOGS = {
    [REQUEST_DIALOGS.DECIDE]: DecisionDialog,
    [REQUEST_DIALOGS.PICK]: PickDialog,
    [REQUEST_DIALOGS.DELIVER]: DeliverDialog,
    [REQUEST_DIALOGS.CANCEL]: CancelDialog,
}

const hasActions = (actions) =>
    Boolean(actions.canCancel || actions.canDecide || actions.canPick || actions.canDeliver)

const RequestActions = ({ actions, onOpen }) => (
    <>
        {actions.canCancel && (
            <Button variant="outline" family="deny" onClick={() => onOpen(REQUEST_DIALOGS.CANCEL)}>
                Cancelar solicitação
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

const RequestBody = ({ data, actions }) => (
    <Stack gap={32}>
        {actions.isAwaitingDecision && (
            <Callout tone={TONES.WARNING}>{REQUEST_MESSAGES.awaitingDecision}</Callout>
        )}
        {data.status === REQUEST_STATUS.APPROVED && (
            <Callout tone={TONES.INFO}>{REQUEST_MESSAGES.pickNotice}</Callout>
        )}
        <FormSection
            title="Família"
            action={<TextLink to={buildFamilyLink(data.beneficiary.id)}>Ver histórico</TextLink>}
        >
            <DescriptionList
                items={[
                    { label: 'Responsável', value: data.beneficiary.responsibleName },
                    { label: 'Integrantes', value: String(data.beneficiary.householdSize) },
                    { label: 'Bairro', value: data.beneficiary.neighborhood },
                ]}
            />
            {OPEN_STATUSES.includes(data.status) && (
                <RecentDeliveriesNotice summary={data.familyHistory} />
            )}
        </FormSection>
        <FormSection title="Itens" subtitle="Solicitado × aprovado">
            <Panel padded={false}>
                <RequestItemsTable request={data} />
            </Panel>
        </FormSection>
        <FormSection title="Histórico da solicitação">
            <RequestTimeline request={data} />
        </FormSection>
        {data.delivery && <DeliveryReceipt request={data} />}
    </Stack>
)

export const RequestDetailDialog = ({ requestId, onClose, onChanged }) => {
    const { request, error, reload, actions } = useRequestDetail(requestId)
    const actionDialog = useDisclosure()
    const ActiveDialog = actionDialog.isOpen ? DIALOGS[actionDialog.payload] : null

    const handleDone = () => {
        actionDialog.close()
        reload()
        onChanged()
    }

    if (ActiveDialog && request) {
        return <ActiveDialog request={request} onClose={actionDialog.close} onDone={handleDone} />
    }

    return (
        <Dialog
            isOpen
            kind={DIALOG_KINDS.VIEW}
            size={DIALOG_SIZES.LG}
            title={
                <>
                    Solicitação #{requestId}{' '}
                    {request && (
                        <Badge tone={REQUEST_STATUS_TONES[request.status]}>
                            {REQUEST_STATUS_LABELS[request.status]}
                        </Badge>
                    )}
                </>
            }
            description={
                request ? `${request.beneficiaryName} · criada por ${request.requestedBy}` : ''
            }
            onClose={onClose}
            footer={
                hasActions(actions) && (
                    <RequestActions actions={actions} onOpen={actionDialog.open} />
                )
            }
        >
            <AsyncContent data={request} error={error} onRetry={reload}>
                {(data) => <RequestBody data={data} actions={actions} />}
            </AsyncContent>
        </Dialog>
    )
}
