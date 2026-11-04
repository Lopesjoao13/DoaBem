import { useId } from 'react'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { FormField } from '@/components/FormField/FormField.jsx'
import { FormRow, FormStack } from '@/components/FormLayout/FormLayout.jsx'
import { Select } from '@/components/Select/Select.jsx'
import { TONES } from '@/constants/tones.js'
import { UNIT_LABELS, UNITS } from '@/constants/units.js'
import { useItemForm } from '@/hooks/useItemForm.js'

const UNIT_OPTIONS = [
    { value: UNITS.UNIT, label: 'Unidade (un) — só inteiros' },
    { value: UNITS.KG, label: 'Quilograma (kg) — até 3 casas' },
    { value: UNITS.L, label: 'Litro (L) — até 3 casas' },
]

const SELECT_CATEGORY = { value: '', label: 'Selecione a categoria' }
const SELECT_UNIT = { value: '', label: 'Selecione a unidade' }

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
                    <Button variant="outline" onClick={onClose}>
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
                <FormField
                    label="Nome"
                    id={`${formId}-name`}
                    name="name"
                    value={values.name}
                    onChange={form.handleChange}
                    error={errors.name}
                    autoFocus
                />
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
                    <FormField
                        label={`Estoque mínimo${values.unitOfMeasure ? ` (${UNIT_LABELS[values.unitOfMeasure]})` : ''}`}
                        id={`${formId}-min`}
                        name="minStock"
                        inputMode="decimal"
                        value={values.minStock}
                        onChange={form.handleChange}
                        error={errors.minStock}
                        hint="Crítico quando o disponível for igual ou menor."
                    />
                </FormRow>
            </FormStack>
        </Dialog>
    )
}
