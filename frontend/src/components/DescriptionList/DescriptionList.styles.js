import styled from 'styled-components'

export const StyledDescriptionList = styled.dl`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px 24px;
    margin: 0;
`

export const Term = styled.dt`
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-text-muted);
`

export const Detail = styled.dd`
    margin: 4px 0 0;
    font-size: 14px;
    overflow-wrap: anywhere;
`
