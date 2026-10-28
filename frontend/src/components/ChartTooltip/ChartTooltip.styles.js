import styled from 'styled-components'

export const TooltipBox = styled.span`
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    z-index: 5;
    display: none;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-badge);
    background: var(--color-surface);
    box-shadow: var(--shadow-floating);
    white-space: nowrap;
    transform: translateX(-50%);
    pointer-events: none;
`

export const Key = styled.span`
    width: 12px;
    height: 2px;
    border-radius: 1px;
    background: ${({ $color }) => $color};
`

export const Value = styled.strong`
    font-size: 13px;
    font-weight: 700;
    color: var(--color-text);
`

export const Label = styled.span`
    font-size: 12px;
    color: var(--color-text-muted);
`
