import { Link } from 'react-router-dom'
import { Tooltip } from '@/components/Tooltip/Tooltip.jsx'
import { StyledIconButton } from './IconButton.styles.js'

export const IconButton = ({ icon: Icon, label, tone = 'neutral', to, ...props }) => (
    <Tooltip content={label}>
        <StyledIconButton
            as={to ? Link : 'button'}
            to={to}
            type={to ? undefined : 'button'}
            aria-label={label}
            $tone={tone}
            {...props}
        >
            <Icon size={18} stroke={2} />
        </StyledIconButton>
    </Tooltip>
)
