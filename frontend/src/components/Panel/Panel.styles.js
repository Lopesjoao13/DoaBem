import styled from 'styled-components'

export const StyledPanel = styled.section`
    min-width: 0;
    padding: ${({ $padded }) => ($padded ? '32px' : '0')};
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    background: var(--color-surface);
`

export const Header = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: ${({ $padded }) => ($padded ? '0 0 24px' : '24px 32px 16px')};
`

export const Title = styled.h2`
    font-size: 16px;
    font-weight: 600;
`

export const Subtitle = styled.p`
    font-size: 12px;
    color: var(--color-fg-muted);
`
