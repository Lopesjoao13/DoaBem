import styled, { css } from 'styled-components'

export const fieldControlStyles = css`
    width: 100%;
    padding: 10px 16px;
    border: 1px solid
        ${({ $hasError }) => ($hasError ? 'var(--color-critical)' : 'var(--color-border)')};
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
        border-color: ${({ $hasError }) =>
            $hasError ? 'var(--color-critical)' : 'var(--color-primary)'};
    }

    &:disabled {
        background: var(--color-bg);
        color: var(--color-text-muted);
    }
`

export const readOnlyStyles = css`
    &:read-only {
        background: var(--color-bg);
        color: var(--color-text-muted);
    }
`

export const StyledInput = styled.input`
    ${fieldControlStyles}
    ${readOnlyStyles}
`
