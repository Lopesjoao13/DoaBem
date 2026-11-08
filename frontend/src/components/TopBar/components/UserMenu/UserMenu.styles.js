import styled from 'styled-components'

export const Wrapper = styled.div`
    position: relative;
`

export const Trigger = styled.button`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 8px;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;

    &:hover {
        background: var(--white-alpha-15);
    }
`

export const Avatar = styled.span`
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--amber-400);
    color: var(--teal-900);
    font-size: 14px;
    font-weight: 700;
`

export const Identity = styled.div`
    display: flex;
    flex-direction: column;
    line-height: 1.25;

    @media (max-width: 640px) {
        display: none;
    }
`

export const UserName = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: var(--white);
`

export const UserRole = styled.span`
    font-size: 12px;
`

export const Panel = styled.div`
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    z-index: 40;
    display: flex;
    flex-direction: column;
    width: 280px;
    padding: 8px 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    color: var(--color-fg);
    box-shadow: var(--shadow-modal);
`

export const Header = styled.div`
    display: flex;
    flex-direction: column;
    padding: 8px 16px 12px;
`

export const Name = styled.span`
    font-size: 14px;
    font-weight: 700;
`

export const Email = styled.span`
    font-size: 12px;
    color: var(--color-fg-muted);
`

export const Divider = styled.hr`
    width: 100%;
    margin: 8px 0;
    border: none;
    border-top: 1px solid var(--color-border);
`

export const SectionTitle = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 16px;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-fg-muted);
`

export const Item = styled.button`
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 8px 16px;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: 14px;
    font-weight: ${({ $isSelected }) => ($isSelected ? 600 : 400)};
    text-align: left;
    cursor: pointer;

    &:hover {
        background: var(--gray-100);
    }

    > :last-child:not(:first-child) {
        margin-left: auto;
    }
`

export const Mark = styled.span`
    display: grid;
    place-items: center;
    width: 18px;
    height: 18px;
    color: var(--teal-500);
`

export const Dot = styled.span`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--teal-500);
`
