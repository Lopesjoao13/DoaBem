import { ErrorText, Hint, Label, StyledField } from './Field.styles.js'

export const Field = ({ label, htmlFor, hint, error, children }) => (
    <StyledField>
        <Label htmlFor={htmlFor}>{label}</Label>
        {children}
        {error && <ErrorText id={`${htmlFor}-error`}>{error}</ErrorText>}
        {!error && hint && <Hint id={`${htmlFor}-hint`}>{hint}</Hint>}
    </StyledField>
)
