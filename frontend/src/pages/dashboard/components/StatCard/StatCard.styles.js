import styled from 'styled-components'
import { TONES } from '@/constants/tones.js'

const VALUE_COLORS = {
    [TONES.NEUTRAL]: 'var(--color-text)',
    [TONES.CRITICAL]: 'var(--color-critical)',
    [TONES.WARNING]: 'var(--color-accent-text)',
}

export const StyledStatCard = styled.article`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface);
`

export const Top = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    color: var(--color-text-muted);
`

export const Label = styled.h2`
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
`

export const Value = styled.p`
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
    color: ${({ $tone }) => VALUE_COLORS[$tone] ?? VALUE_COLORS[TONES.NEUTRAL]};
`

export const Hint = styled.p`
    font-size: 12px;
    color: var(--color-text-muted);
`

export const Scope = styled.span`
    align-self: flex-start;
    margin-top: 8px;
    padding: 2px 8px;
    border-radius: var(--radius-badge);
    background: var(--color-bg);
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-muted);
`
