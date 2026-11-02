import styled from 'styled-components'

export const Wrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 220px;

    > svg {
        position: absolute;
        left: 16px;
        pointer-events: none;
        color: var(--color-fg-muted);
    }
`

export const StyledSearchInput = styled.input`
    width: 100%;
    height: var(--input-height);
    padding: 0 48px 0 44px;
    border: 1px solid
        ${({ $isFilled }) => ($isFilled ? 'var(--color-fg)' : 'var(--color-border-strong)')};
    border-radius: var(--radius);
    background: ${({ $isFilled }) => ($isFilled ? 'var(--blue-100)' : 'var(--color-surface)')};
    color: var(--color-fg);
    font: inherit;
    font-size: 14px;
    letter-spacing: var(--tracking-base);
    transition: border-color var(--duration-fast) var(--ease-out);

    &::-webkit-search-cancel-button {
        display: none;
    }

    &::placeholder {
        color: var(--gray-400);
    }

    &:hover:not(:focus) {
        border-color: ${({ $isFilled }) => ($isFilled ? 'var(--color-fg)' : 'var(--gray-600)')};
    }

    &:focus {
        outline: none;
        border-color: var(--color-fg);
    }
`

export const ClearButton = styled.button`
    position: absolute;
    right: 16px;
    display: grid;
    place-items: center;
    width: 18px;
    height: 18px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--gray-600);
    cursor: pointer;
`
