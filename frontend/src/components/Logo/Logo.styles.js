import styled from 'styled-components'

export const StyledLogo = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ $compact }) => ($compact ? '8px' : '12px')};
    font-size: ${({ $compact }) => ($compact ? '16px' : '20px')};
    font-weight: 700;
    color: var(--white);

    span {
        color: var(--color-accent);
    }
`

export const LogoMark = styled.div`
    display: grid;
    place-items: center;
    width: ${({ $compact }) => ($compact ? '28px' : '40px')};
    height: ${({ $compact }) => ($compact ? '28px' : '40px')};
    border-radius: var(--radius);
    background: var(--color-accent);
    color: var(--color-sidebar);
`
