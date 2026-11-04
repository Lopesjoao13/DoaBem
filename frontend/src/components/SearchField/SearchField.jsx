import { IconSearch } from '@tabler/icons-react'
import { StyledSearchInput, Wrapper } from './SearchField.styles.js'

export const SearchField = (props) => (
    <Wrapper>
        <IconSearch size={16} stroke={2} aria-hidden="true" />
        <StyledSearchInput type="search" {...props} />
    </Wrapper>
)
