import styled from 'styled-components'

export const Panel = styled.aside`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 40px;
    background: var(--color-sidebar);
    color: var(--color-sidebar-text);

    @media (max-width: 768px) {
        display: none;
    }
`

export const Hero = styled.div`
    max-width: 480px;
`

export const Eyebrow = styled.p`
    margin-bottom: 16px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-accent);
`

export const Headline = styled.h2`
    margin-bottom: 16px;
    font-size: 24px;
    font-weight: 700;
    color: var(--white);
`

export const Lead = styled.p`
    font-size: 16px;
    opacity: 0.85;
`

export const Footer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
`

export const Facts = styled.dl`
    display: flex;
    gap: 32px;
    margin: 0;
    padding-top: 16px;
    border-top: 1px solid var(--color-divider);
`

export const Term = styled.dt`
    font-size: 12px;
    opacity: 0.7;
`

export const Description = styled.dd`
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--white);
`
