import { Panel } from '@/components/Panel/Panel.jsx'
import { StateMessage } from '@/components/StateMessage/StateMessage.jsx'
import { CATEGORY_COLORS } from '@/pages/dashboard/constants/dashboard.js'
import { formatNumber } from '@/utils/formatters.js'
import {
    Center,
    CenterLabel,
    CenterText,
    CenterValue,
    Legend,
    LegendRow,
    Ring,
    Swatch,
    Wrapper,
} from './CategoryDonut.styles.js'
import {
    DONUT_RADIUS,
    DONUT_CIRCUMFERENCE,
    DONUT_GAP,
} from '@/pages/dashboard/constants/dashboardUi.js'

const buildSegments = (categories, total) =>
    categories.reduce((segments, category, index) => {
        const length = (category.available / total) * DONUT_CIRCUMFERENCE
        const offset = segments.reduce((sum, segment) => sum + segment.length, 0)
        return [
            ...segments,
            {
                ...category,
                length,
                offset,
                color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                percent: Math.round((category.available / total) * 100),
            },
        ]
    }, [])

export const CategoryDonut = ({ categories }) => {
    const total = categories.reduce((sum, category) => sum + category.available, 0)
    const segments = total > 0 ? buildSegments(categories, total) : []

    return (
        <Panel title="Saldo por categoria" subtitle="Disponível agora · soma das quantidades">
            {total === 0 ? (
                <StateMessage
                    title="Sem saldo disponível"
                    description="Registre entradas para acompanhar o saldo por categoria."
                />
            ) : (
                <Wrapper>
                    <Center>
                        <Ring
                            viewBox="0 0 140 140"
                            role="img"
                            aria-label={`Saldo disponível total: ${formatNumber(total)}`}
                        >
                            {segments.map((segment) => (
                                <circle
                                    key={segment.categoryId}
                                    cx="70"
                                    cy="70"
                                    r={DONUT_RADIUS}
                                    fill="none"
                                    stroke={segment.color}
                                    strokeWidth="18"
                                    strokeDasharray={`${Math.max(segment.length - DONUT_GAP, 0)} ${DONUT_CIRCUMFERENCE}`}
                                    strokeDashoffset={-segment.offset}
                                    transform="rotate(-90 70 70)"
                                >
                                    <title>{`${segment.categoryName}: ${formatNumber(segment.available)}`}</title>
                                </circle>
                            ))}
                        </Ring>
                        <CenterText>
                            <CenterValue>{formatNumber(total)}</CenterValue>
                            <CenterLabel>disponível</CenterLabel>
                        </CenterText>
                    </Center>
                    <Legend>
                        {segments.map((segment) => (
                            <LegendRow key={segment.categoryId}>
                                <Swatch $color={segment.color} aria-hidden="true" />
                                <span>{segment.categoryName}</span>
                                <strong>{formatNumber(segment.available)}</strong>
                                <span>{segment.percent}%</span>
                            </LegendRow>
                        ))}
                    </Legend>
                </Wrapper>
            )}
        </Panel>
    )
}
