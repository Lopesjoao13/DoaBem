import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

export const StyledSideBar = styled.aside`
    position: sticky;
    top: var(--topbar-height);
    height: calc(100vh - var(--topbar-height));
    overflow-y: auto;
    padding: 24px 12px;
    border-right: 1px solid var(--color-border);
    background: var(--color-surface);
`

export const Nav = styled.nav`
    display: flex;
    flex-direction: column;
    gap: 24px;
`

export const Group = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`

export const GroupTitle = styled.span`
    padding: 0 12px 4px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
`

export const NavItem = styled(NavLink)`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: var(--radius);
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text);
    text-decoration: none;

    &:hover {
        background: var(--color-bg);
    }

    &.active {
        background: var(--color-primary-soft);
        color: var(--color-primary);
        font-weight: 600;
    }
`
