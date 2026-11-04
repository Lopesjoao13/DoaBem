import { IconHeartHandshake } from '@tabler/icons-react'
import { LogoMark, StyledLogo } from './Logo.styles.js'

export const Logo = ({ compact = false }) => (
    <StyledLogo $compact={compact}>
        <LogoMark $compact={compact}>
            <IconHeartHandshake size={compact ? 16 : 20} stroke={2} />
        </LogoMark>
        <div>
            Doa<span>Bem</span>
        </div>
    </StyledLogo>
)
