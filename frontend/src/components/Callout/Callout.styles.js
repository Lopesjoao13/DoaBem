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

export const StyledCallout = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    border-radius: var(--radius);
    background: ${({ $tone }) => TONE_COLORS[$tone].background};
    font-size: 14px;
    color: var(--color-fg);

    > svg {
        flex-shrink: 0;
        margin-top: 4px;
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
