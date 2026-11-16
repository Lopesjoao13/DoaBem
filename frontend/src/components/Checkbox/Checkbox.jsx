import { Box, StyledCheckbox } from './Checkbox.styles.js'

export const Checkbox = ({ label, ...props }) => (
    <StyledCheckbox>
        <Box type="checkbox" {...props} />
        {label}
    </StyledCheckbox>
)
