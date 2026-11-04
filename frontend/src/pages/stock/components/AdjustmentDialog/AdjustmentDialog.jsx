import { useId } from 'react'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { FormRow, FormStack } from '@/components/FormLayout/FormLayout.jsx'
import { Input } from '@/components/Input/Input.jsx'
import { Select } from '@/components/Select/Select.jsx'
import { Textarea } from '@/components/Textarea/Textarea.jsx'
import { ADJUSTMENT_REASON_LABELS, ADJUSTMENT_REASONS } from '@/constants/movementTypes.js'
import { TONES } from '@/constants/tones.js'
import { UNIT_LABELS } from '@/constants/units.js'
import { useAdjustmentForm } from '@/hooks/useAdjustmentForm.js'
import { getDescribedBy } from '@/utils/a11y.js'
import { formatQuantity } from '@/utils/formatters.js'
import { getQuantityStep } from '@/utils/quantity.js'

const REASON_OPTIONS = Object.values(ADJUSTMENT_REASONS).map((reason) => ({
    value: reason,
    label: ADJUSTMENT_REASON_LABELS[reason],
}))

const SELECT_ITEM = { value: '', label: 'Selecione o item' }
const SELECT_REASON = { value: '', label: 'Selecione o motivo' }

export const AdjustmentDialog = ({ initialItemId, onClose, onSaved }) => {
    const formId = useId()
    const form = useAdjustmentForm({ initialItemId, onSaved })
    const { values, errors, selectedItem } = form
    const quantityHint = selectedItem
        ? `Disponível: ${formatQuantity(selectedItem.available, selectedItem.unitOfMeasure)}`
        : 'Selecione o item para ver o saldo disponível.'

    return (
        <Dialog
            isOpen
            title="Registrar saída por ajuste"
            description="Use para perda, avaria, vencimento ou transferência. A entrega à família não é ajuste."
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" form={formId} family="deny" disabled={form.isSubmitting}>
                        {form.isSubmitting ? 'Registrando...' : 'Registrar saída'}
                    </Button>
                </>
            }
        >
            <FormStack id={formId} onSubmit={form.submit} noValidate>
                {form.formError && <Callout tone={TONES.CRITICAL}>{form.formError}</Callout>}
                <Field label="Item" htmlFor={`${formId}-item`} error={errors.itemId}>
                    <Select
                        id={`${formId}-item`}
                        name="itemId"
                        value={values.itemId}
                        onChange={form.handleChange}
                        options={form.itemOptions}
                        placeholder={SELECT_ITEM}
                        error={errors.itemId}
                        disabled={form.isLoadingItems}
                    />
                </Field>
                <FormRow>
                    <Field
                        label={`Quantidade${selectedItem ? ` (${UNIT_LABELS[selectedItem.unitOfMeasure]})` : ''}`}
                        htmlFor={`${formId}-quantity`}
                        hint={quantityHint}
                        error={errors.quantity}
                    >
                        <Input
                            id={`${formId}-quantity`}
                            name="quantity"
                            inputMode="decimal"
                            step={
                                selectedItem
                                    ? getQuantityStep(selectedItem.unitOfMeasure)
                                    : undefined
                            }
                            value={values.quantity}
                            onChange={form.handleChange}
                            error={errors.quantity}
                            aria-describedby={getDescribedBy(`${formId}-quantity`, {
                                error: errors.quantity,
                                hint: quantityHint,
                            })}
                        />
                    </Field>
                    <Field
                        label="Motivo"
                        htmlFor={`${formId}-reason`}
                        error={errors.adjustmentReason}
                    >
                        <Select
                            id={`${formId}-reason`}
                            name="adjustmentReason"
                            value={values.adjustmentReason}
                            onChange={form.handleChange}
                            options={REASON_OPTIONS}
                            placeholder={SELECT_REASON}
                            error={errors.adjustmentReason}
                        />
                    </Field>
                </FormRow>
                <Field label="Observação" htmlFor={`${formId}-notes`} error={errors.notes}>
                    <Textarea
                        id={`${formId}-notes`}
                        name="notes"
                        value={values.notes}
                        onChange={form.handleChange}
                        error={errors.notes}
                        placeholder="Descreva o que aconteceu"
                    />
                </Field>
                <Callout tone={TONES.WARNING}>
                    A saída reduz o saldo físico e fica registrada no histórico com seu usuário. Só
                    pode ser desfeita por estorno.
                </Callout>
            </FormStack>
        </Dialog>
    )
}
