import styled from 'styled-components'

const TONE_COLORS = {
    neutral: { color: 'var(--gray-900)', hover: 'var(--gray-100)' },
    deny: { color: 'var(--red-500)', hover: 'var(--red-50)' },
    confirm: { color: 'var(--green-600)', hover: 'var(--green-50)' },
}

export const StyledIconButton = styled.button`
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    color: ${({ $tone }) => TONE_COLORS[$tone].color};
    cursor: pointer;
    transition: background var(--duration-fast) var(--ease-out);

    &:hover:not(:disabled) {
        background: ${({ $tone }) => TONE_COLORS[$tone].hover};
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`
