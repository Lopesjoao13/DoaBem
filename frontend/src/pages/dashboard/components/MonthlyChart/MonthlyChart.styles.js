import styled from 'styled-components'
import { TooltipBox } from '@/pages/dashboard/components/ChartTooltip/ChartTooltip.styles.js'
import { CHART_PLOT_HEIGHT, CHART_AXIS_WIDTH } from '@/pages/dashboard/constants/dashboardUi.js'

export const Chart = styled.div`
    display: grid;
    grid-template-columns: ${CHART_AXIS_WIDTH} 1fr;
    grid-template-rows: ${CHART_PLOT_HEIGHT} auto;
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
    color: var(--color-fg-muted);
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
    background: ${({ $bottom }) => ($bottom === 0 ? 'var(--color-border)' : 'var(--gray-200)')};
`

export const Group = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    gap: 4px;
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

export const BarValue = styled.span`
    position: absolute;
    bottom: calc(${({ $height }) => $height}% + 4px);
    left: 50%;
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    transform: translateX(-50%);
    color: var(--color-fg);
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
    color: var(--color-fg-muted);
`
