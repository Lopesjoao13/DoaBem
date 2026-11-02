import styled from 'styled-components'
import { STOCK_LEVELS } from '@/constants/stockLevels.js'

const LEVEL_COLORS = {
    [STOCK_LEVELS.CRITICAL]: 'var(--red-500)',
    [STOCK_LEVELS.LOW]: 'var(--amber-400)',
    [STOCK_LEVELS.NORMAL]: 'var(--green-400)',
}

export const Wrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 120px;
`

export const Track = styled.div`
    flex: 1;
    height: 6px;
    overflow: hidden;
    border-radius: 3px;
    background: var(--color-bg);
`

export const Fill = styled.div`
    width: ${({ $percent }) => `${$percent}%`};
    height: 100%;
    border-radius: 3px;
    background: ${({ $level }) => LEVEL_COLORS[$level]};
`

export const MinLabel = styled.span`
    font-size: 12px;
    white-space: nowrap;
    color: var(--color-fg-muted);
`
