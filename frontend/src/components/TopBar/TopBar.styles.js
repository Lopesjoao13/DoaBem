import styled from 'styled-components'

export const StyledTopBar = styled.header`
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--topbar-height);
    padding: 0 24px;
    background: var(--color-sidebar);
    color: var(--color-sidebar-text);
`

export const Brand = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`

export const Tagline = styled.span`
    padding-left: 16px;
    border-left: 1px solid var(--color-divider);
    font-size: 14px;
`
