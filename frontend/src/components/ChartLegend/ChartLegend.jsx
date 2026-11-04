import { LegendItem, StyledChartLegend, Swatch } from './ChartLegend.styles.js'

export const ChartLegend = ({ series }) => (
    <StyledChartLegend>
        {series.map(({ key, label, color }) => (
            <LegendItem key={key}>
                <Swatch $color={color} aria-hidden="true" />
                {label}
            </LegendItem>
        ))}
    </StyledChartLegend>
)
