import { Counter, ErrorText, Footer, Hint, Label, StyledField } from './Field.styles.js'

export const Field = ({ label, htmlFor, hint, error, maxLength, length = 0, children }) => (
    <StyledField>
        <Label htmlFor={htmlFor}>{label}</Label>
        {children}
        {(error || hint || maxLength) && (
            <Footer>
                {error && <ErrorText id={`${htmlFor}-error`}>{error}</ErrorText>}
                {!error && hint && <Hint id={`${htmlFor}-hint`}>{hint}</Hint>}
                {maxLength && (
                    <Counter $isAtLimit={length >= maxLength} aria-hidden="true">
                        {length}/{maxLength}
                    </Counter>
                )}
            </Footer>
        )}
    </StyledField>
)
