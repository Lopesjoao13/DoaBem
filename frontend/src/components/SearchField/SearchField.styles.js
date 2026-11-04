import styled from 'styled-components'

export const Wrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 220px;

    > svg {
        position: absolute;
        left: 12px;
        pointer-events: none;
        color: var(--color-text-muted);
    }
`

export const StyledSearchInput = styled.input`
    width: 100%;
    padding: 10px 16px 10px 36px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface);
    color: var(--color-text);
    font: inherit;
    font-size: 14px;

    &::placeholder {
        color: var(--color-text-muted);
    }

    &:focus {
        outline: none;
        border-color: var(--color-primary);
    }
`
