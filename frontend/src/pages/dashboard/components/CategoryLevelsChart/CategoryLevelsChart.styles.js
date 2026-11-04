import styled from 'styled-components'
import { TooltipBox } from '@/components/ChartTooltip/ChartTooltip.styles.js'

export const Rows = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 20px 0 0;
    padding: 0;
    list-style: none;
`

export const Row = styled.li`
    display: grid;
    grid-template-columns: 88px 1fr 24px;
    align-items: center;
    gap: 12px;
`

export const CategoryName = styled.span`
    overflow: hidden;
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
`

export const Track = styled.div`
    display: flex;
    height: 24px;
`

export const Stack = styled.div`
    display: flex;
    gap: 2px;
    width: ${({ $width }) => `${$width}%`};
`

export const Segment = styled.span`
    position: relative;
    flex: ${({ $grow }) => $grow} 1 0;
    min-width: 4px;
    background: ${({ $color }) => $color};
    cursor: default;

    &:last-child {
        border-radius: 0 4px 4px 0;
    }

    &:hover,
    &:focus-visible {
        filter: brightness(1.12);
    }

    &:hover ${TooltipBox}, &:focus-visible ${TooltipBox} {
        display: flex;
    }
`

export const Total = styled.span`
    font-size: 14px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    text-align: right;
`
