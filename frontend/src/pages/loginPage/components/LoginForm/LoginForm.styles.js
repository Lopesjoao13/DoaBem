import styled from 'styled-components'

export const Container = styled.div`
    width: 100%;
    max-width: 360px;
`

export const Eyebrow = styled.p`
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-accent);
`

export const Title = styled.h1`
    margin-bottom: 8px;
    font-size: 24px;
    font-weight: 700;
`

export const Subtitle = styled.p`
    margin-bottom: 24px;
    font-size: 14px;
    color: var(--color-text-muted);
`

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
`

export const ErrorMessage = styled.p`
    font-size: 14px;
    color: var(--color-critical);
`

export const Footer = styled.p`
    margin-top: 24px;
    text-align: center;
    font-size: 12px;
    color: var(--color-text-muted);
`
