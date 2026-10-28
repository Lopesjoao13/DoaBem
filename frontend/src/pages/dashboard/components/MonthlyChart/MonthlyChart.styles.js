import styled from 'styled-components'
import { TooltipBox } from '@/components/ChartTooltip/ChartTooltip.styles.js'

const PLOT_HEIGHT = '200px'
const AXIS_WIDTH = '32px'

export const Chart = styled.div`
    display: grid;
    grid-template-columns: ${AXIS_WIDTH} 1fr;
    grid-template-rows: ${PLOT_HEIGHT} auto;
    row-gap: 8px;
`

export const YAxis = styled.div`
    position: relative;
`

export const TickLabel = styled.span`
    position: absolute;
    right: 8px;
    bottom: ${({ $bottom }) => `${$bottom}%`};
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    color: var(--color-text-muted);
    transform: translateY(50%);
`

export const Plot = styled.div`
    position: relative;
    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-flow: column;
`

export const GridLine = styled.span`
    position: absolute;
    right: 0;
    bottom: ${({ $bottom }) => `${$bottom}%`};
    left: 0;
    height: 1px;
    background: ${({ $bottom }) =>
        $bottom === 0 ? 'var(--color-border)' : 'var(--color-chart-grid)'};
`

export const Group = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    gap: 2px;
`

export const Bar = styled.span`
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: ${({ $height }) => `${$height}%`};
    border-radius: 4px 4px 0 0;
    background: ${({ $color }) => $color};
`

export const BarSlot = styled.span`
    position: relative;
    flex: 0 1 24px;
    height: 100%;
    cursor: default;

    &:hover ${Bar}, &:focus-visible ${Bar} {
        filter: brightness(1.12);
    }

    &:hover ${TooltipBox}, &:focus-visible ${TooltipBox} {
        display: flex;
        bottom: calc(${({ $height }) => $height}% + 8px);
    }
`

export const MonthLabels = styled.div`
    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-flow: column;
    grid-column: 2;
`

export const MonthLabel = styled.span`
    font-size: 12px;
    text-align: center;
    text-transform: capitalize;
    color: var(--color-text-muted);
`
