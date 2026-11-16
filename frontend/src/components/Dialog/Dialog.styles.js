import styled, { keyframes } from 'styled-components'
import { DIALOG_WIDTHS } from '@/constants/dialog.js'

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
`

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.96);
  }
`

export const Overlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: var(--black-alpha-45);
    animation: ${fadeIn} var(--duration-base) var(--ease-out);
`

export const Panel = styled.div`
    display: flex;
    flex-direction: column;
    width: min(${({ $size }) => DIALOG_WIDTHS[$size]}, 100%);
    max-height: calc(100vh - 48px);
    border-radius: var(--radius-xl);
    background: var(--color-surface);
    box-shadow: var(--shadow-modal);
    animation: ${scaleIn} var(--duration-base) var(--ease-out);

    &:focus {
        outline: none;
    }
`

export const Header = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 24px 32px;
    border-bottom: 1px solid var(--color-border);
`

export const Title = styled.h2`
    font-size: 18px;
    font-weight: 700;
`

export const Description = styled.p`
    margin-top: 4px;
    font-size: 14px;
    color: var(--color-fg-muted);
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

export const Body = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 24px 32px;
`

export const Footer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 32px;
    border-top: 1px solid var(--color-border);
`
