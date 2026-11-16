import { TONES } from '@/constants/tones.js'
import { StyledBadge } from './Badge.styles.js'

export const Badge = ({ tone = TONES.NEUTRAL, children }) => (
    <StyledBadge $tone={tone}>{children}</StyledBadge>
)
