import { StyledButton } from './Button.styles.js'

export const Button = ({
    variant = 'solid',
    family = 'main',
    size = 'md',
    type = 'button',
    children,
    ...props
}) => (
    <StyledButton type={type} $variant={variant} $family={family} $size={size} {...props}>
        {children}
    </StyledButton>
)
