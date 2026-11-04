import { Badge } from '@/components/Badge/Badge.jsx'
import { Logo } from '@/components/Logo/Logo.jsx'
import { USE_MOCK } from '@/constants/api.js'
import { TONES } from '@/constants/tones.js'
import { UserMenu } from './components/UserMenu/UserMenu.jsx'
import { Brand, StyledTopBar, Tagline } from './TopBar.styles.js'

export const TopBar = () => (
    <StyledTopBar>
        <Brand>
            <Logo compact />
            <Tagline>Controle de estoque de doações</Tagline>
            {USE_MOCK && <Badge tone={TONES.WARNING}>Dados fictícios</Badge>}
        </Brand>
        <UserMenu />
    </StyledTopBar>
)
