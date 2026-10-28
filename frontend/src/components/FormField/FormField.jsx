import { Field } from '@/components/Field/Field.jsx'
import { Input } from '@/components/Input/Input.jsx'
import { getDescribedBy } from '@/utils/a11y.js'

export const FormField = ({ label, id, hint, error, ...inputProps }) => (
    <Field label={label} htmlFor={id} hint={hint} error={error}>
        <Input
            id={id}
            error={error}
            aria-describedby={getDescribedBy(id, { error, hint })}
            {...inputProps}
        />
    </Field>
)
