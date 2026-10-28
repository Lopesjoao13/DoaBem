import { useId } from 'react'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { FormStack } from '@/components/FormLayout/FormLayout.jsx'
import { Textarea } from '@/components/Textarea/Textarea.jsx'
import { REQUEST_MESSAGES } from '@/constants/requestMessages.js'
import { TONES } from '@/constants/tones.js'
import { useReasonForm } from '@/hooks/useReasonForm.js'
import { deliverRequest } from '@/services/requestService.js'
import { formatQuantity } from '@/utils/formatters.js'

const COLUMNS = [
    { key: 'itemName', header: 'Item' },
    {
        key: 'approvedQty',
        header: 'Quantidade a entregar',
        align: 'right',
        noWrap: true,
        render: (row) => formatQuantity(row.approvedQty, row.unitOfMeasure),
    },
]

export const DeliverDialog = ({ request, onClose, onDone }) => {
    const formId = useId()
    const form = useReasonForm({
        field: 'notes',
        required: false,
        action: (values) => deliverRequest(request.id, values),
        successMessage: REQUEST_MESSAGES.delivered,
        onDone,
    })
    const items = request.items.filter((requestItem) => requestItem.approvedQty > 0)

    return (
        <Dialog
            isOpen
            title={`Confirmar entrega #${request.id}`}
            description={`Para ${request.beneficiary.responsibleName}`}
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={form.isSubmitting}>
                        Voltar
                    </Button>
                    <Button
                        type="submit"
                        form={formId}
                        family="confirm"
                        disabled={form.isSubmitting}
                    >
                        {form.isSubmitting ? 'Confirmando...' : 'Confirmar entrega'}
                    </Button>
                </>
            }
        >
            <FormStack id={formId} onSubmit={form.submit} noValidate>
                {form.formError && <Callout tone={TONES.CRITICAL}>{form.formError}</Callout>}
                <Callout tone={TONES.INFO} title="Resumo fechado">
                    {REQUEST_MESSAGES.deliverNotice}
                </Callout>
                <DataTable columns={COLUMNS} rows={items} />
                <Field label="Observação (opcional)" htmlFor={`${formId}-notes`}>
                    <Textarea
                        id={`${formId}-notes`}
                        name="notes"
                        value={form.values.notes}
                        onChange={form.handleChange}
                    />
                </Field>
            </FormStack>
        </Dialog>
    )
}
