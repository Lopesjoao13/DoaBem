import { useId } from 'react'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { FormField } from '@/components/FormField/FormField.jsx'
import { FormStack } from '@/components/FormLayout/FormLayout.jsx'
import { Textarea } from '@/components/Textarea/Textarea.jsx'
import { TONES } from '@/constants/tones.js'
import { useCategoryForm } from '@/hooks/useCategoryForm.js'

export const CategoryDialog = ({ category, onClose, onSaved }) => {
    const formId = useId()
    const form = useCategoryForm({ category, onSaved })
    const { values, errors } = form

    return (
        <Dialog
            isOpen
            title={category ? 'Editar categoria' : 'Nova categoria'}
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" form={formId} disabled={form.isSubmitting}>
                        {form.isSubmitting ? 'Salvando...' : 'Salvar categoria'}
                    </Button>
                </>
            }
        >
            <FormStack id={formId} onSubmit={form.submit} noValidate>
                {form.formError && <Callout tone={TONES.CRITICAL}>{form.formError}</Callout>}
                <FormField
                    label="Nome"
                    id={`${formId}-name`}
                    name="name"
                    value={values.name}
                    onChange={form.handleChange}
                    error={errors.name}
                    autoFocus
                />
                <Field label="Descrição (opcional)" htmlFor={`${formId}-description`}>
                    <Textarea
                        id={`${formId}-description`}
                        name="description"
                        value={values.description}
                        onChange={form.handleChange}
                    />
                </Field>
            </FormStack>
        </Dialog>
    )
}
