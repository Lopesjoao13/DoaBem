import { IconAlertTriangle, IconCircleCheck, IconInfoCircle } from '@tabler/icons-react'
import { TONES } from '@/constants/tones.js'
import { Content, StyledCallout, Title } from './Callout.styles.js'

const TONE_ICONS = {
    [TONES.SUCCESS]: IconCircleCheck,
    [TONES.WARNING]: IconAlertTriangle,
    [TONES.CRITICAL]: IconAlertTriangle,
    [TONES.INFO]: IconInfoCircle,
    [TONES.NEUTRAL]: IconInfoCircle,
}

export const Callout = ({ tone = TONES.INFO, title, children }) => {
    const Icon = TONE_ICONS[tone]

    return (
        <StyledCallout $tone={tone} role={tone === TONES.CRITICAL ? 'alert' : undefined}>
            <Icon size={18} stroke={2} aria-hidden="true" />
            <Content>
                {title && <Title>{title}</Title>}
                {children}
            </Content>
        </StyledCallout>
    )
}
