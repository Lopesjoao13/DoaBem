import styled from 'styled-components'

export const Wrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    min-width: 0;
`

export const StyledDateInput = styled.input`
    width: 100%;
    height: var(--input-height);
    padding: 0 72px 0 16px;
    border: 1px solid
        ${({ $hasError, $isFilled }) => {
            if ($hasError) return 'var(--red-500)'
            return $isFilled ? 'var(--color-fg)' : 'var(--color-border-strong)'
        }};
    border-radius: var(--radius);
    background: ${({ $isFilled }) => ($isFilled ? 'var(--blue-100)' : 'var(--color-surface)')};
    color: var(--color-fg);
    font: inherit;
    font-size: 14px;
    letter-spacing: var(--tracking-base);
    transition: border-color var(--duration-fast) var(--ease-out);

    &::placeholder {
        color: var(--gray-400);
    }

    &:hover:not(:disabled, :focus) {
        border-color: ${({ $hasError }) => ($hasError ? 'var(--red-500)' : 'var(--gray-600)')};
    }

    &:focus {
        outline: none;
        border-color: ${({ $hasError }) => ($hasError ? 'var(--red-500)' : 'var(--color-fg)')};
    }

    &:disabled {
        border-color: var(--gray-200);
        background: var(--gray-100);
        color: var(--gray-600);
        cursor: not-allowed;
    }
`

export const IconSlot = styled.span`
    position: absolute;
    right: 16px;
    display: grid;
    pointer-events: none;
    color: ${({ $isDisabled }) => ($isDisabled ? 'var(--gray-500)' : 'var(--color-fg-muted)')};
`

export const ClearButton = styled.button`
    position: absolute;
    right: 44px;
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

export const Popover = styled.div`
    position: fixed;
    z-index: 60;
`
