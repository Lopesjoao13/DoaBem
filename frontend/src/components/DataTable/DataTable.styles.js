import styled from 'styled-components'
import { TONES } from '@/constants/tones.js'

const ROW_BACKGROUNDS = {
    [TONES.CRITICAL]: 'var(--color-critical-soft)',
    [TONES.WARNING]: 'var(--color-accent-soft)',
}

export const Scroll = styled.div`
    overflow-x: auto;
`

export const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
`

export const HeaderCell = styled.th`
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-align: ${({ $align }) => $align ?? 'left'};
    text-transform: uppercase;
    white-space: nowrap;
    color: var(--color-text-muted);
`

export const Row = styled.tr`
    background: ${({ $tone }) => ROW_BACKGROUNDS[$tone] ?? 'transparent'};

    &:not(:last-child) td {
        border-bottom: 1px solid var(--color-border);
    }
`

export const Cell = styled.td`
    padding: 12px 16px;
    text-align: ${({ $align }) => $align ?? 'left'};
    vertical-align: middle;
    white-space: ${({ $noWrap }) => ($noWrap ? 'nowrap' : 'normal')};
`
