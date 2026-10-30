import { useId } from 'react'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { RecentDeliveriesNotice } from '@/components/DeliveryHistory/DeliveryHistory.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { Input } from '@/components/Input/Input.jsx'
import { Stack } from '@/components/Stack/Stack.jsx'
import { Textarea } from '@/components/Textarea/Textarea.jsx'
import { REQUEST_MESSAGES } from '@/constants/requestMessages.js'
import { TONES } from '@/constants/tones.js'
import { UNIT_LABELS } from '@/constants/units.js'
import { useDecisionForm } from '@/hooks/useDecisionForm.js'
import { formatQuantity } from '@/utils/formatters.js'
import { ItemMeta, ItemName, ItemRow, Items } from './DecisionDialog.styles.js'

export const DecisionDialog = ({ request, onClose, onDone }) => {
    const formId = useId()
    const form = useDecisionForm({ request, onDone })
    const approvedErrors = form.errors.approved ?? {}

    const handleSubmit = (event) => {
        event.preventDefault()
        form.approve()
    }

    return (
        <Dialog
            isOpen
            title={`Analisar solicitação #${request.id}`}
            description={`${request.beneficiary.responsibleName} · ${request.beneficiary.householdSize} integrante(s)`}
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={form.isSubmitting}>
                        Voltar
                    </Button>
                    <Button
                        variant="outline"
                        family="deny"
                        onClick={form.reject}
                        disabled={form.isSubmitting}
                    >
                        Recusar
                    </Button>
                    <Button
                        type="submit"
                        form={formId}
                        family="confirm"
                        disabled={form.isSubmitting}
                    >
                        {form.isSubmitting ? 'Salvando...' : 'Aprovar'}
                    </Button>
                </>
            }
        >
            <Stack as="form" id={formId} onSubmit={handleSubmit} noValidate>
                {form.formError && <Callout tone={TONES.CRITICAL}>{form.formError}</Callout>}
                <RecentDeliveriesNotice summary={request.familyHistory} />
                <Callout tone={TONES.WARNING}>{REQUEST_MESSAGES.approveNotice}</Callout>
                <Items>
                    {request.items.map((requestItem) => (
                        <ItemRow key={requestItem.id}>
                            <div>
                                <ItemName>{requestItem.itemName}</ItemName>
                                <ItemMeta>
                                    Solicitado{' '}
                                    {formatQuantity(
                                        requestItem.requestedQty,
                                        requestItem.unitOfMeasure,
                                    )}{' '}
                                    · disponível{' '}
                                    {formatQuantity(
                                        requestItem.available,
                                        requestItem.unitOfMeasure,
                                    )}
                                </ItemMeta>
                            </div>
                            <Field
                                label={`Aprovado (${UNIT_LABELS[requestItem.unitOfMeasure]})`}
                                htmlFor={`${formId}-${requestItem.id}`}
                                error={approvedErrors[requestItem.id]}
                            >
                                <Input
                                    id={`${formId}-${requestItem.id}`}
                                    inputMode="decimal"
                                    value={form.values.approved[requestItem.id]}
                                    onChange={(event) =>
                                        form.changeApproved(requestItem.id, event.target.value)
                                    }
                                    error={approvedErrors[requestItem.id]}
                                />
                            </Field>
                        </ItemRow>
                    ))}
                </Items>
                <Field
                    label="Justificativa"
                    htmlFor={`${formId}-justification`}
                    hint="Obrigatória para aprovação parcial ou recusa. Aprovado 0 tira o item da distribuição."
                    error={form.errors.justification}
                >
                    <Textarea
                        id={`${formId}-justification`}
                        name="justification"
                        value={form.values.justification}
                        onChange={form.handleChange}
                        error={form.errors.justification}
                    />
                </Field>
            </Stack>
        </Dialog>
    )
}
