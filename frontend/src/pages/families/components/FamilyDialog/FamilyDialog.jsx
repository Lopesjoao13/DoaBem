import { useId } from 'react'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { FormField } from '@/components/FormField/FormField.jsx'
import { FormRow, FormStack } from '@/components/FormLayout/FormLayout.jsx'
import { Textarea } from '@/components/Textarea/Textarea.jsx'
import { FAMILY_MESSAGES } from '@/constants/familyMessages.js'
import { TONES } from '@/constants/tones.js'
import { useFamilyForm } from '@/hooks/useFamilyForm.js'

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
                    <Button variant="outline" onClick={onClose}>
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
                <FormField
                    label="Nome do responsável"
                    id={`${formId}-name`}
                    name="responsibleName"
                    value={values.responsibleName}
                    onChange={form.handleChange}
                    error={errors.responsibleName}
                    autoFocus
                />
                <FormRow>
                    <FormField
                        label="Telefone (opcional)"
                        id={`${formId}-phone`}
                        name="phone"
                        type="tel"
                        value={values.phone}
                        onChange={form.handleChange}
                    />
                    <FormField
                        label="Nº de integrantes"
                        id={`${formId}-size`}
                        name="householdSize"
                        inputMode="numeric"
                        value={values.householdSize}
                        onChange={form.handleChange}
                        error={errors.householdSize}
                    />
                </FormRow>
                <FormField
                    label="Bairro / localidade (opcional)"
                    id={`${formId}-neighborhood`}
                    name="neighborhood"
                    value={values.neighborhood}
                    onChange={form.handleChange}
                />
                <Field
                    label="Observações (opcional)"
                    htmlFor={`${formId}-notes`}
                    hint={FAMILY_MESSAGES.notesHint}
                >
                    <Textarea
                        id={`${formId}-notes`}
                        name="notes"
                        value={values.notes}
                        onChange={form.handleChange}
                    />
                </Field>
            </FormStack>
        </Dialog>
    )
}
