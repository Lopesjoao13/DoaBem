import styled, { css, keyframes } from 'styled-components'
import { DIALOG_VARIANTS } from '@/constants/dialog.js'

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
`

const slideIn = keyframes`
  from {
    transform: translateX(24px);
  }
`

const VARIANT_OVERLAY = {
    [DIALOG_VARIANTS.DRAWER]: css`
        justify-content: flex-end;
    `,
    [DIALOG_VARIANTS.MODAL]: css`
        align-items: center;
        justify-content: center;
        padding: 24px;
    `,
}

const VARIANT_PANEL = {
    [DIALOG_VARIANTS.DRAWER]: css`
        width: min(520px, 100vw);
        height: 100%;
        animation: ${slideIn} 180ms ease-out;
    `,
    [DIALOG_VARIANTS.MODAL]: css`
        width: min(480px, 100%);
        max-height: calc(100vh - 48px);
        border-radius: var(--radius);
    `,
}

export const Overlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    background: var(--color-overlay);
    animation: ${fadeIn} 160ms ease-out;
    ${({ $variant }) => VARIANT_OVERLAY[$variant]}
`

export const Panel = styled.div`
    display: flex;
    flex-direction: column;
    background: var(--color-surface);
    box-shadow: var(--shadow-floating);
    ${({ $variant }) => VARIANT_PANEL[$variant]}

    &:focus {
        outline: none;
    }
`

export const Header = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 20px 24px;
    border-bottom: 1px solid var(--color-border);
`

export const Title = styled.h2`
    font-size: 18px;
    font-weight: 700;
`

export const Description = styled.p`
    margin-top: 4px;
    font-size: 14px;
    color: var(--color-text-muted);
`

export const CloseButton = styled.button`
    display: grid;
    place-items: center;
    padding: 4px;
    border: none;
    border-radius: var(--radius-badge);
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;

    &:hover {
        background: var(--color-bg);
    }
`

export const Body = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 24px;
`

export const Footer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid var(--color-border);
`
