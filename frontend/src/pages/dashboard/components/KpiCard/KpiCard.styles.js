import styled from 'styled-components'
import { TONES } from '@/constants/tones.js'

const VALUE_COLORS = {
    [TONES.NEUTRAL]: 'var(--color-fg)',
    [TONES.CRITICAL]: 'var(--red-500)',
    [TONES.WARNING]: 'var(--amber-700)',
}

const BADGE_COLORS = {
    [TONES.NEUTRAL]: { background: 'var(--gray-100)', color: 'var(--color-fg-muted)' },
    [TONES.CRITICAL]: { background: 'var(--red-50)', color: 'var(--red-500)' },
    [TONES.WARNING]: { background: 'var(--amber-50)', color: 'var(--amber-700)' },
}

export const StyledKpiCard = styled.article`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 24px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    background: var(--color-surface);
    color: inherit;
    text-decoration: none;
    transition:
        border-color var(--duration-fast) var(--ease-out),
        background var(--duration-fast) var(--ease-out);

    ${({ $isLink }) =>
        $isLink &&
        `
        &:hover {
            border-color: var(--teal-500);
            background: var(--gray-50);
        }
    `}
`

export const Top = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
`

export const Label = styled.h2`
    font-size: 12px;
    font-weight: 600;
    letter-spacing: var(--tracking-tight);
    text-transform: uppercase;
    color: var(--color-fg-muted);
`

export const IconBadge = styled.span`
    display: grid;
    place-items: center;
    width: ${({ $isHighlighted }) => ($isHighlighted ? '40px' : '32px')};
    height: ${({ $isHighlighted }) => ($isHighlighted ? '40px' : '32px')};
    border-radius: var(--radius);
    background: ${({ $tone }) => BADGE_COLORS[$tone].background};
    color: ${({ $tone }) => BADGE_COLORS[$tone].color};
`

export const Value = styled.p`
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
    color: ${({ $tone }) => VALUE_COLORS[$tone]};
`

export const Hint = styled.p`
    font-size: 12px;
    color: var(--color-fg-muted);
`

export const DeltaText = styled.p`
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: 12px;
    color: var(--color-fg-muted);
`

export const Footer = styled.span`
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--teal-500);
`
