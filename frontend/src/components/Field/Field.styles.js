import styled from 'styled-components'

export const StyledField = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
`

export const Label = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
`

export const Hint = styled.span`
    font-size: 12px;
    color: var(--color-text-muted);
`

export const ErrorText = styled.span`
    font-size: 12px;
    color: var(--color-critical);
`
