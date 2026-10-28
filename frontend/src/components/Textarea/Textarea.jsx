import { StyledTextarea } from './Textarea.styles.js'

export const Textarea = ({ error, rows = 3, ...props }) => (
    <StyledTextarea
        rows={rows}
        aria-invalid={Boolean(error)}
        $hasError={Boolean(error)}
        {...props}
    />
)
