import styled from 'styled-components'

export const Group = styled.div`
    display: inline-flex;
    max-width: 100%;
    overflow-x: auto;
    padding: 4px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--gray-100);
`

export const Segment = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: none;
    border-radius: var(--radius-xs);
    background: ${({ $isActive }) => ($isActive ? 'var(--color-surface)' : 'transparent')};
    color: ${({ $isActive }) => ($isActive ? 'var(--color-fg)' : 'var(--color-fg-muted)')};
    font: inherit;
    font-size: 14px;
    font-weight: ${({ $isActive }) => ($isActive ? 700 : 600)};
    letter-spacing: var(--tracking-base);
    white-space: nowrap;
    cursor: pointer;
    transition:
        background var(--duration-fast) var(--ease-out),
        color var(--duration-fast) var(--ease-out);

    &:hover {
        color: var(--color-fg);
    }

    > span {
        min-width: 24px;
        padding: 0 8px;
        border-radius: var(--radius-pill);
        background: ${({ $isActive }) => ($isActive ? 'var(--teal-50)' : 'var(--gray-200)')};
        color: ${({ $isActive }) => ($isActive ? 'var(--teal-500)' : 'var(--color-fg-muted)')};
        font-size: 12px;
        font-weight: 700;
        text-align: center;
    }
`
