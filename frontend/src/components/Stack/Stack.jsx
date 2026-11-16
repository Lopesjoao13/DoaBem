import { StyledStack } from './Stack.styles.js'

export const Stack = ({ gap = 16, children, ...props }) => (
    <StyledStack $gap={gap} {...props}>
        {children}
    </StyledStack>
)
