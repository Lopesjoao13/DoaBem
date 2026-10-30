import { IconLogout } from '@tabler/icons-react'
import { ROLE_LABELS } from '@/constants/roles.js'
import { useAuth } from '@/hooks/useAuth.js'
import { Avatar, Identity, LogoutButton, UserName, UserRole, Wrapper } from './UserMenu.styles.js'

export const UserMenu = () => {
    const { user, signOut } = useAuth()

    return (
        <Wrapper>
            <Avatar aria-hidden="true">{user.name.charAt(0)}</Avatar>
            <Identity>
                <UserName>{user.name}</UserName>
                <UserRole>{ROLE_LABELS[user.role]}</UserRole>
            </Identity>
            <LogoutButton type="button" onClick={signOut} aria-label="Sair" title="Sair">
                <IconLogout size={18} stroke={2} />
            </LogoutButton>
        </Wrapper>
    )
}
