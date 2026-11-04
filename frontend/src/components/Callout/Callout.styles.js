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

export const StyledCallout = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    border-radius: var(--radius);
    background: ${({ $tone }) => TONE_COLORS[$tone].background};
    font-size: 14px;
    color: var(--color-text);

    > svg {
        flex-shrink: 0;
        margin-top: 2px;
        color: ${({ $tone }) => TONE_COLORS[$tone].color};
    }
`

export const Content = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`

export const Title = styled.p`
    font-weight: 600;
`
