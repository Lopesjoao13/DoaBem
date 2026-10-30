import { useId } from 'react'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { FormStack } from '@/components/FormLayout/FormLayout.jsx'
import { Textarea } from '@/components/Textarea/Textarea.jsx'
import { DIALOG_VARIANTS } from '@/constants/dialog.js'
import { REQUEST_MESSAGES } from '@/constants/requestMessages.js'
import { REQUEST_STATUS } from '@/constants/requestStatus.js'
import { TONES } from '@/constants/tones.js'
import { useReasonForm } from '@/hooks/useReasonForm.js'
import { cancelRequest } from '@/services/requestService.js'

export const CancelDialog = ({ request, onClose, onDone }) => {
    const formId = useId()
    const form = useReasonForm({
        action: (values) => cancelRequest(request.id, values),
        successMessage: REQUEST_MESSAGES.cancelled,
        onDone,
    })
    const isPicked = request.status === REQUEST_STATUS.PICKED

    return (
        <Dialog
            isOpen
            variant={DIALOG_VARIANTS.MODAL}
            title={
                isPicked
                    ? `Cancelar separação #${request.id}?`
                    : `Cancelar solicitação #${request.id}?`
            }
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={form.isSubmitting}>
                        Voltar
                    </Button>
                    <Button type="submit" form={formId} family="deny" disabled={form.isSubmitting}>
                        {form.isSubmitting ? 'Cancelando...' : 'Cancelar solicitação'}
                    </Button>
                </>
            }
        >
            <FormStack id={formId} onSubmit={form.submit} noValidate>
                {form.formError && <Callout tone={TONES.CRITICAL}>{form.formError}</Callout>}
                <Callout tone={TONES.WARNING}>
                    {isPicked
                        ? 'As reservas desta solicitação serão liberadas e o disponível volta ao valor anterior.'
                        : 'Nada foi reservado ainda; o estoque não muda.'}
                </Callout>
                <Field label="Motivo" htmlFor={`${formId}-reason`} error={form.errors.reason}>
                    <Textarea
                        id={`${formId}-reason`}
                        name="reason"
                        value={form.values.reason}
                        onChange={form.handleChange}
                        error={form.errors.reason}
                        autoFocus
                    />
                </Field>
            </FormStack>
        </Dialog>
    )
}
