import styled from 'styled-components'

export const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    align-items: end;
    gap: 12px;
    padding: 16px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface);
`

export const ClearSlot = styled.div`
    display: flex;
    justify-content: flex-end;
`
