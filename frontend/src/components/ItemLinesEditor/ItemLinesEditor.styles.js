import styled from 'styled-components'

export const StyledItemLinesEditor = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`

export const Lines = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`

export const LineGrid = styled.div`
    display: grid;
    grid-template-columns: ${({ $hasExpiry }) =>
        $hasExpiry
            ? 'minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) 44px'
            : 'minmax(0, 2fr) minmax(0, 1fr) 44px'};
    align-items: start;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-bg);
`

export const RemoveSlot = styled.div`
    padding-top: 26px;
`
