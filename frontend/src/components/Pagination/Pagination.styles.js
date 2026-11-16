import styled from 'styled-components'

export const StyledPagination = styled.nav`
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 16px;
    padding: 12px 32px;
    border-top: 1px solid var(--color-border);
    background: var(--gray-50);

    @media (max-width: 720px) {
        grid-template-columns: 1fr;
        justify-items: center;
    }
`

export const Side = styled.div`
    display: flex;
    align-items: center;
`

export const Summary = styled.span`
    font-size: 14px;
    color: var(--color-fg-muted);

    strong {
        font-weight: 700;
        color: var(--color-fg);
    }
`

export const Nav = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 8px;
`

export const PageButton = styled.button`
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    border: none;
    border-radius: var(--radius);
    background: ${({ $isActive }) => ($isActive ? 'var(--teal-500)' : 'transparent')};
    color: ${({ $isActive }) => ($isActive ? 'var(--white)' : 'var(--teal-500)')};
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:disabled {
        cursor: not-allowed;
    }

    &:hover:not([aria-current], :disabled) {
        background: var(--gray-200);
    }
`

export const Arrow = styled.button`
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    color: var(--teal-500);
    cursor: pointer;

    &:hover:not(:disabled) {
        background: var(--gray-200);
    }

    &:disabled {
        color: var(--gray-400);
        cursor: not-allowed;
    }
`

export const EdgeButton = styled.button`
    padding: 0 8px;
    border: none;
    background: none;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    color: var(--teal-500);
    white-space: nowrap;
    cursor: pointer;

    &:disabled {
        font-weight: 400;
        color: var(--gray-400);
        cursor: not-allowed;
    }
`

export const Dots = styled.span`
    min-width: 20px;
    text-align: center;
    color: var(--color-fg-muted);
`
