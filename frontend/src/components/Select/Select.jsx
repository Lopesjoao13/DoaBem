import { IconChevronDown } from '@tabler/icons-react'
import { StyledSelect, Wrapper } from './Select.styles.js'

export const Select = ({ options, placeholder, error, ...props }) => (
    <Wrapper>
        <StyledSelect aria-invalid={Boolean(error)} $hasError={Boolean(error)} {...props}>
            {placeholder && <option value={placeholder.value}>{placeholder.label}</option>}
            {options.map(({ value, label }) => (
                <option key={value} value={value}>
                    {label}
                </option>
            ))}
        </StyledSelect>
        <IconChevronDown size={16} stroke={2} aria-hidden="true" />
    </Wrapper>
)
