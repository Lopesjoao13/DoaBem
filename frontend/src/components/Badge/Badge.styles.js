import styled from 'styled-components'
import { TONES } from '@/constants/tones.js'

const TONE_COLORS = {
    [TONES.NEUTRAL]: { background: 'var(--color-bg)', color: 'var(--color-text-muted)' },
    [TONES.SUCCESS]: {
        background: 'var(--color-success-soft)',
        color: 'var(--color-success-text)',
    },
    [TONES.WARNING]: { background: 'var(--color-accent-soft)', color: 'var(--color-accent-text)' },
    [TONES.CRITICAL]: { background: 'var(--color-critical-soft)', color: 'var(--color-critical)' },
    [TONES.INFO]: { background: 'var(--color-info-soft)', color: 'var(--color-info)' },
}

export const StyledBadge = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border: 1px solid color-mix(in srgb, currentColor 30%, transparent);
    border-radius: var(--radius-badge);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
    white-space: nowrap;
    background: ${({ $tone }) => TONE_COLORS[$tone].background};
    color: ${({ $tone }) => TONE_COLORS[$tone].color};
`
