import styled, { css } from 'styled-components'

export const fieldControlStyles = css`
    width: 100%;
    height: var(--input-height);
    padding: 0 16px;
    border: 1px solid
        ${({ $hasError }) => ($hasError ? 'var(--red-500)' : 'var(--color-border-strong)')};
    border-radius: var(--radius);
    background: var(--color-surface);
    color: var(--color-fg);
    font: inherit;
    font-size: 14px;
    letter-spacing: var(--tracking-base);
    transition: border-color var(--duration-fast) var(--ease-out);

    &::placeholder {
        color: var(--gray-400);
    }

    &:hover:not(:disabled, :read-only, :focus) {
        border-color: ${({ $hasError }) => ($hasError ? 'var(--red-500)' : 'var(--gray-600)')};
    }

    &:focus {
        outline: none;
        border-color: ${({ $hasError }) => ($hasError ? 'var(--red-500)' : 'var(--color-fg)')};
    }

    &:disabled {
        border-color: var(--gray-200);
        color: var(--gray-600);
        cursor: not-allowed;
    }
`

export const readOnlyStyles = css`
    &:read-only {
        border-color: var(--gray-200);
        background: var(--gray-100);
        color: var(--gray-900);
    }
`

export const StyledInput = styled.input`
    ${fieldControlStyles}
    ${readOnlyStyles}
`
