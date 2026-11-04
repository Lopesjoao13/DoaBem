import { TONES } from '@/constants/tones.js'
import { Hint, Label, Scope, StyledStatCard, Top, Value } from './StatCard.styles.js'

export const StatCard = ({ label, value, hint, scope, icon: Icon, tone = TONES.NEUTRAL }) => (
    <StyledStatCard>
        <Top>
            <Label>{label}</Label>
            <Icon size={18} stroke={2} aria-hidden="true" />
        </Top>
        <Value $tone={tone}>{value}</Value>
        {hint && <Hint>{hint}</Hint>}
        <Scope>{scope}</Scope>
    </StyledStatCard>
)
