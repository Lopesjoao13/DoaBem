import { Checkbox } from '@/components/Checkbox/Checkbox.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { FormField } from '@/components/FormField/FormField.jsx'
import { FormRow } from '@/components/FormLayout/FormLayout.jsx'
import { Stack } from '@/components/Stack/Stack.jsx'
import { Textarea } from '@/components/Textarea/Textarea.jsx'
import { getTodayIso } from '@/utils/dateRange.js'

export const EntryHeaderFields = ({ values, errors, onChange }) => (
    <Stack>
        <FormRow>
            <FormField
                label="Data da entrada"
                id="entry-date"
                type="date"
                name="entryDate"
                max={getTodayIso()}
                value={values.entryDate}
                onChange={onChange}
                error={errors.entryDate}
            />
            <FormField
                label="Origem / doador (opcional)"
                id="entry-source"
                name="source"
                value={values.anonymous ? '' : values.source}
                onChange={onChange}
                disabled={values.anonymous}
                hint="Texto livre. Não é comprovação fiscal."
                placeholder="Ex.: Paróquia São João"
            />
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
