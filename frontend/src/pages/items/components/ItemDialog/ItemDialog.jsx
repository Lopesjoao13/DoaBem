import { useId } from 'react'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { FormRow, FormStack } from '@/components/FormLayout/FormLayout.jsx'
import { Select } from '@/components/Select/Select.jsx'
import { Input } from '@/components/Input/Input.jsx'
import { TONES } from '@/constants/tones.js'
import { UNIT_LABELS } from '@/constants/units.js'
import { useItemForm } from '@/pages/items/hooks/useItemForm.js'
import { getDescribedBy } from '@/utils/a11y.js'
import { UNIT_OPTIONS, SELECT_CATEGORY, SELECT_UNIT } from '@/pages/items/constants/itemOptions.js'

export const ItemDialog = ({ item, categories, onClose, onSaved }) => {
    const formId = useId()
    const form = useItemForm({ item, onSaved })
    const { values, errors } = form
    const categoryOptions = categories
        .filter((category) => category.active || category.id === item?.categoryId)
        .map((category) => ({ value: String(category.id), label: category.name }))

    return (
        <Dialog
            isOpen
            title={item ? 'Editar item' : 'Novo item'}
            onClose={onClose}
            footer={
                <>
                    <Button variant="outline" family="deny" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" form={formId} disabled={form.isSubmitting}>
                        {form.isSubmitting ? 'Salvando...' : 'Salvar item'}
                    </Button>
                </>
            }
        >
            <FormStack id={formId} onSubmit={form.submit} noValidate>
                {form.formError && <Callout tone={TONES.CRITICAL}>{form.formError}</Callout>}
                <Field label="Nome" htmlFor={`${formId}-name`} error={errors.name}>
                    <Input
                        id={`${formId}-name`}
                        error={errors.name}
                        aria-describedby={getDescribedBy(`${formId}-name`, { error: errors.name })}
                        name="name"
                        value={values.name}
                        onChange={form.handleChange}
                        autoFocus
                    />
                </Field>
                <Field label="Categoria" htmlFor={`${formId}-category`} error={errors.categoryId}>
                    <Select
                        id={`${formId}-category`}
                        name="categoryId"
                        value={values.categoryId}
                        onChange={form.handleChange}
                        options={categoryOptions}
                        placeholder={SELECT_CATEGORY}
                        error={errors.categoryId}
                    />
                </Field>
                <FormRow>
                    <Field
                        label="Unidade base"
                        htmlFor={`${formId}-unit`}
                        hint={
                            item
                                ? 'A unidade não muda depois do cadastro.'
                                : 'Não há conversão entre unidades.'
                        }
                        error={errors.unitOfMeasure}
                    >
                        <Select
                            id={`${formId}-unit`}
                            name="unitOfMeasure"
                            value={values.unitOfMeasure}
                            onChange={form.handleChange}
                            options={UNIT_OPTIONS}
                            placeholder={SELECT_UNIT}
                            error={errors.unitOfMeasure}
                            disabled={Boolean(item)}
                        />
                    </Field>
                    <Field
                        label={`Estoque mínimo${values.unitOfMeasure ? ` (${UNIT_LABELS[values.unitOfMeasure]})` : ''}`}
                        htmlFor={`${formId}-min`}
                        hint="Crítico quando o disponível for igual ou menor."
                        error={errors.minStock}
                    >
                        <Input
                            id={`${formId}-min`}
                            error={errors.minStock}
                            aria-describedby={getDescribedBy(`${formId}-min`, {
                                error: errors.minStock,
                                hint: 'Crítico quando o disponível for igual ou menor.',
                            })}
                            name="minStock"
                            inputMode="decimal"
                            value={values.minStock}
                            onChange={form.handleChange}
                        />
                    </Field>
                </FormRow>
            </FormStack>
        </Dialog>
    )
}
