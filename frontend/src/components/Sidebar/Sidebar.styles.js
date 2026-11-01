import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

export const StyledSidebar = styled.aside`
    position: sticky;
    top: var(--topbar-height);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 24px;
    height: calc(100vh - var(--topbar-height));
    padding: 24px 12px;
    overflow: hidden auto;
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
    white-space: nowrap;
    color: var(--color-fg-muted);
`

export const GroupDivider = styled.hr`
    width: 24px;
    margin: 0 auto 8px;
    border: none;
    border-top: 1px solid var(--color-border);
`

export const Label = styled.span`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

const itemStyles = `
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: var(--radius);
    font-size: 14px;
    text-decoration: none;
`

export const NavItem = styled(NavLink)`
    ${itemStyles}
    justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')};
    font-weight: 500;
    color: var(--color-fg);

    &:hover {
        background: var(--gray-100);
    }

    &.active {
        background: var(--teal-50);
        color: var(--teal-500);
        font-weight: 600;
    }
`

export const ToggleButton = styled.button`
    ${itemStyles}
    justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')};
    border: none;
    background: transparent;
    color: var(--color-fg-muted);
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        background: var(--gray-100);
        color: var(--color-fg);
    }
`
