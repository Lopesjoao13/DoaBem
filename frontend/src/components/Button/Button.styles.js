import styled, { css } from 'styled-components'

const FAMILY_COLORS = {
    main: 'var(--color-primary)',
    confirm: 'var(--color-success)',
    deny: 'var(--color-critical)',
}

const VARIANT_STYLES = {
    solid: (color) => css`
        background: ${color};
        border: 1px solid ${color};
        color: var(--white);

        &:hover:not(:disabled) {
            opacity: 0.9;
        }
    `,
    outline: (color) => css`
        background: transparent;
        border: 1px solid ${color};
        color: ${color};

        &:hover:not(:disabled) {
            background: var(--color-bg);
        }
    `,
    text: (color) => css`
        background: transparent;
        border: 1px solid transparent;
        color: ${color};

        &:hover:not(:disabled) {
            text-decoration: underline;
        }
    `,
}

const SIZE_STYLES = {
    sm: css`
        padding: 4px 8px;
        font-size: 13px;
    `,
    md: css`
        padding: 10px 16px;
        font-size: 14px;
    `,
}

export const StyledButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: var(--radius);
    font: inherit;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;

    ${({ $size }) => SIZE_STYLES[$size]}

    ${({ $variant, $family }) => VARIANT_STYLES[$variant](FAMILY_COLORS[$family])}

  &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`
