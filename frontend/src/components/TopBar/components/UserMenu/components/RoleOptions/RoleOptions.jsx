import { Badge } from '@/components/Badge/Badge.jsx'
import { ROLE_LABELS, ROLES } from '@/constants/roles.js'
import { TONES } from '@/constants/tones.js'
import { useAuth } from '@/hooks/useAuth.js'
import {
    Dot,
    Item,
    Mark,
    SectionTitle,
} from '@/components/TopBar/components/UserMenu/UserMenu.styles.js'

export const RoleOptions = () => {
    const { user, switchRole } = useAuth()

    return (
        <div role="group" aria-label="Perfil de acesso">
            <SectionTitle>
                Perfil de acesso
                <Badge tone={TONES.WARNING}>demo</Badge>
            </SectionTitle>
            {[ROLES.OPERATOR, ROLES.COORDINATOR].map((role) => (
                <Item
                    key={role}
                    type="button"
                    role="menuitemradio"
                    aria-checked={user.role === role}
                    $isSelected={user.role === role}
                    onClick={() => switchRole(role)}
                >
                    <Mark>{user.role === role && <Dot />}</Mark>
                    {ROLE_LABELS[role]}
                </Item>
            ))}
        </div>
    )
}
