import { StyledFormRow, StyledFormStack } from './FormLayout.styles.js'

export const FormStack = ({ children, ...props }) => (
    <StyledFormStack {...props}>{children}</StyledFormStack>
)

export const FormRow = ({ columns = 2, children }) => (
    <StyledFormRow $columns={columns}>{children}</StyledFormRow>
)
