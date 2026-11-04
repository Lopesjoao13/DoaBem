import styled from 'styled-components'
import { fieldControlStyles } from '@/components/Input/Input.styles.js'

export const Wrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    min-width: 0;

    > svg {
        position: absolute;
        right: 12px;
        pointer-events: none;
        color: var(--color-text-muted);
    }
`

export const StyledSelect = styled.select`
    ${fieldControlStyles}
    padding-right: 40px;
    appearance: none;
    cursor: pointer;
`
