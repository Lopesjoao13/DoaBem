import { useId } from 'react'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { FormRow, FormStack } from '@/components/FormLayout/FormLayout.jsx'
import { Textarea } from '@/components/Textarea/Textarea.jsx'
import { Input } from '@/components/Input/Input.jsx'
import { FAMILY_MESSAGES } from '@/pages/families/constants/familyMessages.js'
import { TONES } from '@/constants/tones.js'
import { useFamilyForm } from '@/pages/families/hooks/useFamilyForm.js'
import { getDescribedBy } from '@/utils/a11y.js'
import { FIELD_LIMITS } from '@/constants/fieldLimits.js'
import { sanitizeInteger } from '@/utils/quantity.js'

export const FamilyDialog = ({ family, onClose, onSaved }) => {
    const formId = useId()
    const form = useFamilyForm({ family, onSaved })
    const { values, errors } = form

    return (
        <Dialog
            isOpen
            title={family ? `Editar família #${family.id}` : 'Nova família'}
            description="A identificação interna é gerada automaticamente. Não cadastre CPF, renda, nascimento ou endereço completo."
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" family="deny" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" form={formId} disabled={form.isSubmitting}>
                        {form.isSubmitting ? 'Salvando...' : 'Salvar família'}
                    </Button>
                </>
            }
        >
            <FormStack id={formId} onSubmit={form.submit} noValidate>
                {form.formError && <Callout tone={TONES.CRITICAL}>{form.formError}</Callout>}
                <Field
                    maxLength={FIELD_LIMITS.RESPONSIBLE_NAME}
                    length={values.responsibleName.length}
                    label="Nome do responsável"
                    htmlFor={`${formId}-name`}
                    error={errors.responsibleName}
                >
                    <Input
                        id={`${formId}-name`}
                        error={errors.responsibleName}
                        aria-describedby={getDescribedBy(`${formId}-name`, {
                            error: errors.responsibleName,
                        })}
                        maxLength={FIELD_LIMITS.RESPONSIBLE_NAME}
                        name="responsibleName"
                        value={values.responsibleName}
                        onChange={form.handleChange}
                        autoFocus
                    />
                </Field>
                <FormRow>
                    <Field
                        maxLength={FIELD_LIMITS.PHONE}
                        length={values.phone.length}
                        label="Telefone (opcional)"
                        htmlFor={`${formId}-phone`}
                    >
                        <Input
                            id={`${formId}-phone`}
                            aria-describedby={getDescribedBy(`${formId}-phone`, {})}
                            maxLength={FIELD_LIMITS.PHONE}
                            name="phone"
                            type="tel"
                            value={values.phone}
                            onChange={form.handleChange}
                        />
                    </Field>
                    <Field
                        label="Nº de integrantes"
                        htmlFor={`${formId}-size`}
                        error={errors.householdSize}
                    >
                        <Input
                            id={`${formId}-size`}
                            error={errors.householdSize}
                            aria-describedby={getDescribedBy(`${formId}-size`, {
                                error: errors.householdSize,
                            })}
                            name="householdSize"
                            inputMode="numeric"
                            value={values.householdSize}
                            onChange={(event) =>
                                form.changeField(
                                    'householdSize',
                                    sanitizeInteger(event.target.value),
                                )
                            }
                        />
                    </Field>
                </FormRow>
                <Field
                    maxLength={FIELD_LIMITS.NEIGHBORHOOD}
                    length={values.neighborhood.length}
                    label="Bairro / localidade (opcional)"
                    htmlFor={`${formId}-neighborhood`}
                >
                    <Input
                        id={`${formId}-neighborhood`}
                        aria-describedby={getDescribedBy(`${formId}-neighborhood`, {})}
                        maxLength={FIELD_LIMITS.NEIGHBORHOOD}
                        name="neighborhood"
                        value={values.neighborhood}
                        onChange={form.handleChange}
                    />
                </Field>
                <Field
                    maxLength={FIELD_LIMITS.NOTES}
                    length={values.notes.length}
                    label="Observações (opcional)"
                    htmlFor={`${formId}-notes`}
                    hint={FAMILY_MESSAGES.notesHint}
                >
                    <Textarea
                        id={`${formId}-notes`}
                        maxLength={FIELD_LIMITS.NOTES}
                        name="notes"
                        value={values.notes}
                        onChange={form.handleChange}
                    />
                </Field>
            </FormStack>
        </Dialog>
    )
}
