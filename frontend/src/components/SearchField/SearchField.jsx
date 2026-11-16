import { IconSearch, IconX } from '@tabler/icons-react'
import { ClearButton, StyledSearchInput, Wrapper } from './SearchField.styles.js'

export const SearchField = ({ name, value, onChange, ...props }) => {
    const isFilled = Boolean(value)

    return (
        <Wrapper>
            <IconSearch size={18} stroke={2} aria-hidden="true" />
            <StyledSearchInput
                type="search"
                name={name}
                value={value}
                onChange={onChange}
                $isFilled={isFilled}
                {...props}
            />
            {isFilled && (
                <ClearButton
                    type="button"
                    aria-label="Limpar"
                    onClick={() => onChange({ target: { name, value: '' } })}
                >
                    <IconX size={18} stroke={2} />
                </ClearButton>
            )}
        </Wrapper>
    )
}
