import styled, { css, keyframes } from 'styled-components'
import { STATE_VARIANTS } from '@/constants/stateMessages.js'

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

const VARIANT_COLORS = {
    [STATE_VARIANTS.LOADING]: 'var(--color-primary)',
    [STATE_VARIANTS.EMPTY]: 'var(--color-text-muted)',
    [STATE_VARIANTS.ERROR]: 'var(--color-critical)',
    [STATE_VARIANTS.DENIED]: 'var(--color-critical)',
}

export const StyledStateMessage = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 40px 24px;
    text-align: center;
`

export const IconWrapper = styled.span`
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    margin-bottom: 4px;
    border-radius: 50%;
    background: var(--color-bg);
    color: ${({ $variant }) => VARIANT_COLORS[$variant]};

    ${({ $variant }) =>
        $variant === STATE_VARIANTS.LOADING &&
        css`
            svg {
                animation: ${spin} 1s linear infinite;
            }
        `}
`

export const Title = styled.p`
    font-size: 16px;
    font-weight: 600;
`

export const Description = styled.p`
    max-width: 420px;
    font-size: 14px;
    color: var(--color-text-muted);
`
