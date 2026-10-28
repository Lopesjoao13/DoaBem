import styled from 'styled-components'

export const Wrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`

export const Avatar = styled.span`
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--color-accent);
    color: var(--color-sidebar);
    font-size: 14px;
    font-weight: 700;
`

export const Identity = styled.div`
    display: flex;
    flex-direction: column;
    line-height: 1.25;
`

export const UserName = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: var(--white);
`

export const UserRole = styled.span`
    font-size: 12px;
`

export const LogoutButton = styled.button`
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: var(--radius);
    background: transparent;
    color: var(--color-sidebar-text);
    cursor: pointer;

    &:hover {
        background: var(--color-divider);
        color: var(--white);
    }
`
