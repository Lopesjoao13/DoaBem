import { StyledTextLink } from './TextLink.styles.js'

export const TextLink = ({ children, ...props }) => (
    <StyledTextLink {...props}>{children}</StyledTextLink>
)
