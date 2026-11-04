import styled from 'styled-components'

export const StyledChartLegend = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;
`

export const LegendItem = styled.li`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--color-text-muted);
`

export const Swatch = styled.span`
    width: 10px;
    height: 10px;
    border-radius: 2px;
    background: ${({ $color }) => $color};
`
