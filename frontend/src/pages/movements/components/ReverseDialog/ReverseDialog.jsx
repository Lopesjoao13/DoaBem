import { useId } from 'react'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { Checkbox } from '@/components/Checkbox/Checkbox.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { FormStack } from '@/components/FormLayout/FormLayout.jsx'
import { Textarea } from '@/components/Textarea/Textarea.jsx'
import { DIALOG_VARIANTS } from '@/constants/dialog.js'
import { MOVEMENT_MESSAGES } from '@/constants/movementMessages.js'
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPES } from '@/constants/movementTypes.js'
import { TONES } from '@/constants/tones.js'
import { useReverseForm } from '@/hooks/useReverseForm.js'
import { formatQuantity } from '@/utils/formatters.js'
import { CheckError } from './ReverseDialog.styles.js'

const TYPE_HINTS = {
    [MOVEMENT_TYPES.ENTRY]: MOVEMENT_MESSAGES.entryReverseHint,
    [MOVEMENT_TYPES.DELIVERY]: MOVEMENT_MESSAGES.deliveryReverseHint,
}

export const ReverseDialog = ({ movement, onClose, onDone }) => {
    const formId = useId()
    const form = useReverseForm({ movement, onDone })
    const isDelivery = movement.type === MOVEMENT_TYPES.DELIVERY

    return (
        <Dialog
            isOpen
            variant={DIALOG_VARIANTS.MODAL}
            title={`Estornar lançamento #${movement.id}?`}
            description={`${MOVEMENT_TYPE_LABELS[movement.type]} · ${movement.itemName} · ${formatQuantity(movement.quantity, movement.unitOfMeasure)}`}
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={form.isSubmitting}>
                        Voltar
                    </Button>
                    <Button type="submit" form={formId} family="deny" disabled={form.isSubmitting}>
                        {form.isSubmitting ? 'Estornando...' : 'Estornar'}
                    </Button>
                </>
            }
        >
            <FormStack id={formId} onSubmit={form.submit} noValidate>
                {form.formError && <Callout tone={TONES.CRITICAL}>{form.formError}</Callout>}
                <Callout tone={TONES.WARNING}>
                    {MOVEMENT_MESSAGES.reverseNotice} {TYPE_HINTS[movement.type]}
                </Callout>
                <Field
                    label="Justificativa"
                    htmlFor={`${formId}-justification`}
                    error={form.errors.justification}
                >
                    <Textarea
                        id={`${formId}-justification`}
                        name="justification"
                        value={form.values.justification}
                        onChange={form.handleChange}
                        error={form.errors.justification}
                        autoFocus
                    />
                </Field>
                {isDelivery && (
                    <div>
                        <Checkbox
                            label={MOVEMENT_MESSAGES.itemsReturnedLabel}
                            name="itemsReturned"
                            checked={form.values.itemsReturned}
                            onChange={form.handleChange}
                        />
                        {form.errors.itemsReturned && (
                            <CheckError>{form.errors.itemsReturned}</CheckError>
                        )}
                    </div>
                )}
            </FormStack>
        </Dialog>
    )
}
