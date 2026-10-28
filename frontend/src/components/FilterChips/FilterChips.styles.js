import styled from 'styled-components'

export const Group = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`

export const Chip = styled.button`
    padding: 8px 12px;
    border: 1px solid
        ${({ $isActive }) => ($isActive ? 'var(--color-primary)' : 'var(--color-border)')};
    border-radius: var(--radius);
    background: ${({ $isActive }) => ($isActive ? 'var(--color-primary)' : 'var(--color-surface)')};
    color: ${({ $isActive }) => ($isActive ? 'var(--white)' : 'var(--color-text)')};
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;

    &:hover {
        border-color: var(--color-primary);
    }
`
