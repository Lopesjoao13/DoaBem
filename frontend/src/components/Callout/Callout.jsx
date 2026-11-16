import { TONES, TONE_ICONS } from '@/constants/tones.js'
import { Content, StyledCallout, Title } from './Callout.styles.js'

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
