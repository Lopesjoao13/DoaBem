import styled from 'styled-components'

export const StyledPeriodFilter = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
`

export const DateLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
`

export const DateInput = styled.input`
    padding: 8px 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface);
    color: var(--color-text);
    font: inherit;
    font-size: 14px;

    &:focus {
        outline: none;
        border-color: var(--color-primary);
    }
`
