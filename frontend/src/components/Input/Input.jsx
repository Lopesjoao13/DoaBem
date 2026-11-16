import { StyledInput } from './Input.styles.js'

export const Input = ({ error, ...props }) => (
    <StyledInput aria-invalid={Boolean(error)} $hasError={Boolean(error)} {...props} />
)
