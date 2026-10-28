import { ChartLegend } from '@/components/ChartLegend/ChartLegend.jsx'
import { ChartTooltip } from '@/components/ChartTooltip/ChartTooltip.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { CHART_Y_TICKS, MONTHLY_SERIES } from '@/constants/dashboard.js'
import { getNiceTicks, toPercent } from '@/utils/chartScale.js'
import { formatMonth, formatMonthYear } from '@/utils/formatters.js'
import {
    Bar,
    BarSlot,
    Chart,
    GridLine,
    Group,
    MonthLabel,
    MonthLabels,
    Plot,
    TickLabel,
    YAxis,
} from './MonthlyChart.styles.js'

const getMaxValue = (months) =>
    Math.max(0, ...months.flatMap((month) => MONTHLY_SERIES.map(({ key }) => month[key])))

export const MonthlyChart = ({ months }) => {
    const ticks = getNiceTicks(getMaxValue(months), CHART_Y_TICKS)
    const top = ticks.at(-1)
    const lastMonth = months.at(-1)?.month

    return (
        <Panel
            title="Entradas x entregas"
            subtitle={`Quantidade de registros por mês · 6 meses até ${formatMonthYear(lastMonth)}`}
            action={<ChartLegend series={MONTHLY_SERIES} />}
        >
            <Chart>
                <YAxis aria-hidden="true">
                    {ticks.map((tick) => (
                        <TickLabel key={tick} $bottom={toPercent(tick, top)}>
                            {tick}
                        </TickLabel>
                    ))}
                </YAxis>
                <Plot>
                    {ticks.map((tick) => (
                        <GridLine key={tick} $bottom={toPercent(tick, top)} aria-hidden="true" />
                    ))}
                    {months.map((month) => (
                        <Group key={month.month}>
                            {MONTHLY_SERIES.map(({ key, label, color }) => {
                                const height = toPercent(month[key], top)
                                return (
                                    <BarSlot
                                        key={key}
                                        tabIndex={0}
                                        $height={height}
                                        aria-label={`${label} em ${formatMonthYear(month.month)}: ${month[key]}`}
                                    >
                                        <Bar $color={color} $height={height} />
                                        <ChartTooltip
                                            value={month[key]}
                                            label={label}
                                            color={color}
                                        />
                                    </BarSlot>
                                )
                            })}
                        </Group>
                    ))}
                </Plot>
                <MonthLabels aria-hidden="true">
                    {months.map((month) => (
                        <MonthLabel key={month.month}>{formatMonth(month.month)}</MonthLabel>
                    ))}
                </MonthLabels>
            </Chart>
        </Panel>
    )
}
