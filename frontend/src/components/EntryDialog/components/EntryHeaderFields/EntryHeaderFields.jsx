import { Checkbox } from '@/components/Checkbox/Checkbox.jsx'
import { DateField } from '@/components/DateField/DateField.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { FormRow } from '@/components/FormLayout/FormLayout.jsx'
import { Stack } from '@/components/Stack/Stack.jsx'
import { Textarea } from '@/components/Textarea/Textarea.jsx'
import { Input } from '@/components/Input/Input.jsx'
import { getTodayIso } from '@/utils/dateRange.js'
import { getDescribedBy } from '@/utils/a11y.js'

export const EntryHeaderFields = ({ values, errors, onChange }) => (
    <Stack>
        <FormRow>
            <Field label="Data da entrada" htmlFor="entry-date" error={errors.entryDate}>
                <DateField
                    id="entry-date"
                    name="entryDate"
                    max={getTodayIso()}
                    value={values.entryDate}
                    onChange={onChange}
                    error={errors.entryDate}
                />
            </Field>
            <Field
                label="Origem / doador (opcional)"
                htmlFor="entry-source"
                hint="Texto livre. Não é comprovação fiscal."
            >
                <Input
                    id="entry-source"
                    aria-describedby={getDescribedBy('entry-source', {
                        hint: 'Texto livre. Não é comprovação fiscal.',
                    })}
                    name="source"
                    value={values.anonymous ? '' : values.source}
                    onChange={onChange}
                    disabled={values.anonymous}
                    placeholder="Ex.: Paróquia São João"
                />
            </Field>
        </FormRow>
        <Checkbox
            label="Doação anônima / não informado"
            name="anonymous"
            checked={values.anonymous}
            onChange={onChange}
        />
        <Field label="Observação (opcional)" htmlFor="entry-notes">
            <Textarea id="entry-notes" name="notes" value={values.notes} onChange={onChange} />
        </Field>
    </Stack>
)
