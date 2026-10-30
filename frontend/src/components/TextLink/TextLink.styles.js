import { Link } from 'react-router-dom'
import styled from 'styled-components'

export const StyledTextLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-primary);
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`
