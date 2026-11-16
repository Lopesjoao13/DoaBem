import styled, { keyframes } from 'styled-components'

const pulse = keyframes`
  50% {
    opacity: 0.5;
  }
`

export const StyledSkeleton = styled.span`
    display: block;
    width: ${({ $width }) => $width};
    height: ${({ $height }) => `${$height}px`};
    border-radius: var(--radius);
    background: var(--gray-200);
    animation: ${pulse} 1.2s ease-in-out infinite;
`
