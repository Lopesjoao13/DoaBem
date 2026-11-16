import styled from 'styled-components'
import { TONES } from '@/constants/tones.js'

const TONE_COLORS = {
    [TONES.NEUTRAL]: { background: 'var(--color-bg)', color: 'var(--color-fg-muted)' },
    [TONES.SUCCESS]: {
        background: 'var(--green-50)',
        color: 'var(--green-600)',
    },
    [TONES.WARNING]: { background: 'var(--amber-50)', color: 'var(--amber-700)' },
    [TONES.CRITICAL]: { background: 'var(--red-50)', color: 'var(--red-500)' },
    [TONES.INFO]: { background: 'var(--blue-50)', color: 'var(--blue-500)' },
}

export const StyledBadge = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border: 1px solid color-mix(in srgb, currentColor 30%, transparent);
    border-radius: var(--radius-pill);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
    white-space: nowrap;
    background: ${({ $tone }) => TONE_COLORS[$tone].background};
    color: ${({ $tone }) => TONE_COLORS[$tone].color};
`
