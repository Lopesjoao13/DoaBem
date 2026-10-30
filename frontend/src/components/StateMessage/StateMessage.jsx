import { STATE_PRESETS, STATE_VARIANTS } from '@/constants/stateMessages.js'
import { Description, IconWrapper, StyledStateMessage, Title } from './StateMessage.styles.js'

export const StateMessage = ({ variant = STATE_VARIANTS.EMPTY, title, description, action }) => {
    const { icon: Icon, title: defaultTitle, role } = STATE_PRESETS[variant]

    return (
        <StyledStateMessage role={role}>
            <IconWrapper $variant={variant}>
                <Icon size={24} stroke={2} />
            </IconWrapper>
            <Title>{title ?? defaultTitle}</Title>
            {description && <Description>{description}</Description>}
            {action}
        </StyledStateMessage>
    )
}
