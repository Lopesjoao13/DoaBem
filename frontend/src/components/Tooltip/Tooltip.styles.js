import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
`

const TRANSFORMS = {
    top: ({ isFlipped }) => `translate(-50%, ${isFlipped ? '0' : '-100%'})`,
    right: () => 'translate(0, -50%)',
}

export const Trigger = styled.span`
    display: ${({ $isBlock }) => ($isBlock ? 'flex' : 'inline-flex')};

    > * {
        flex: ${({ $isBlock }) => ($isBlock ? 1 : 'initial')};
    }
`

export const Bubble = styled.span`
    position: fixed;
    top: ${({ $position }) => $position.top}px;
    left: ${({ $position }) => $position.left}px;
    z-index: 60;
    transform: ${({ $position }) => TRANSFORMS[$position.placement]($position)};
    padding: 4px 8px;
    border-radius: var(--radius);
    background: var(--color-bg-inverse);
    color: var(--color-fg-inverse);
    font-size: 12px;
    font-weight: 500;
    line-height: 1.42;
    white-space: nowrap;
    pointer-events: none;
    animation: ${fadeIn} var(--duration-fast) var(--ease-out);
`
