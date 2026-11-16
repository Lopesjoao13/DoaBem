import styled, { keyframes } from 'styled-components'
import { TOAST_TYPES } from '@/constants/toast.js'

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
`

const TYPE_COLORS = {
    [TOAST_TYPES.SUCCESS]: 'var(--green-400)',
    [TOAST_TYPES.ERROR]: 'var(--red-500)',
    [TOAST_TYPES.INFO]: 'var(--blue-500)',
}

export const Viewport = styled.div`
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: min(360px, calc(100vw - 48px));
`

export const Toast = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: var(--shadow-toast);
    animation: ${slideIn} 160ms ease-out;

    > svg {
        flex-shrink: 0;
        color: ${({ $type }) => TYPE_COLORS[$type]};
    }
`

export const Message = styled.p`
    flex: 1;
    font-size: 14px;
`

export const CloseButton = styled.button`
    display: grid;
    place-items: center;
    padding: 4px;
    border: none;
    border-radius: var(--radius-xs);
    background: transparent;
    color: var(--color-fg-muted);
    cursor: pointer;

    &:hover {
        background: var(--color-bg);
    }
`
