import styled from 'styled-components'

export const StyledPagination = styled.nav`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    border-top: 1px solid var(--color-border);
`

export const Summary = styled.span`
    font-size: 14px;
    color: var(--color-text-muted);
`

export const Controls = styled.div`
    display: flex;
    gap: 8px;
`
