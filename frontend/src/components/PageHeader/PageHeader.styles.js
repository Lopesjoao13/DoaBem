import styled from 'styled-components'

export const StyledPageHeader = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px 24px;
`

export const Title = styled.h1`
    font-size: 24px;
    font-weight: 700;
    line-height: 1.3;
`

export const Description = styled.p`
    margin-top: 4px;
    font-size: 14px;
    color: var(--color-fg-muted);
`

export const Actions = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`
