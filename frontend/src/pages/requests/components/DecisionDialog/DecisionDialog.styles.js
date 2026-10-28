import styled from 'styled-components'

export const Items = styled.div`
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
`

export const ItemRow = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) 140px;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;

    &:not(:last-child) {
        border-bottom: 1px solid var(--color-border);
    }
`

export const ItemName = styled.p`
    font-size: 14px;
    font-weight: 600;
`

export const ItemMeta = styled.p`
    font-size: 12px;
    color: var(--color-text-muted);
`
