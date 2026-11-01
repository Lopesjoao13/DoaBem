import { IconArrowRight } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { TONES } from '@/constants/tones.js'
import { getDelta } from '@/utils/delta.js'
import {
    DeltaText,
    Footer,
    Hint,
    IconBadge,
    Label,
    StyledKpiCard,
    Top,
    Value,
} from './KpiCard.styles.js'
import { DELTA_ICONS } from '@/pages/dashboard/constants/dashboardUi.js'

const describeDelta = ({ direction, percent }) => {
    if (direction === 'flat') return 'Igual ao período anterior'
    if (percent === null) return 'Novo em relação ao período anterior'
    return `${percent}% ${direction === 'up' ? 'acima' : 'abaixo'} do período anterior`
}

const Delta = ({ current, previous }) => {
    const delta = getDelta(current, previous)
    const Icon = DELTA_ICONS[delta.direction]
    return (
        <DeltaText>
            <Icon size={14} stroke={2} aria-hidden="true" />
            {describeDelta(delta)}
        </DeltaText>
    )
}

export const KpiCard = ({
    label,
    value,
    hint,
    icon: Icon,
    tone = TONES.NEUTRAL,
    to,
    linkLabel,
    comparison,
    isHighlighted = false,
}) => (
    <StyledKpiCard as={to ? Link : 'article'} to={to} $isLink={Boolean(to)}>
        <Top>
            <Label>{label}</Label>
            <IconBadge $tone={tone} $isHighlighted={isHighlighted}>
                <Icon size={18} stroke={2} aria-hidden="true" />
            </IconBadge>
        </Top>
        <Value $tone={tone}>{value}</Value>
        {hint && <Hint>{hint}</Hint>}
        {comparison && <Delta current={comparison.current} previous={comparison.previous} />}
        {linkLabel && (
            <Footer>
                {linkLabel}
                <IconArrowRight size={14} stroke={2} aria-hidden="true" />
            </Footer>
        )}
    </StyledKpiCard>
)
