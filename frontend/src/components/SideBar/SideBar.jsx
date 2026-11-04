import { useAuth } from '@/hooks/useAuth.js'
import { useSideBarGroups } from '@/hooks/useSideBarGroups.js'
import { Group, GroupTitle, Nav, NavItem, StyledSideBar } from './SideBar.styles.js'

export const SideBar = () => {
    const { user } = useAuth()
    const groups = useSideBarGroups(user.role)

    return (
        <StyledSideBar>
            <Nav aria-label="Navegação principal">
                {groups.map(({ title, items }) => (
                    <Group key={title}>
                        <GroupTitle>{title}</GroupTitle>
                        {items.map(({ label, path, icon: Icon }) => (
                            <NavItem key={path} to={path}>
                                <Icon size={18} stroke={2} />
                                {label}
                            </NavItem>
                        ))}
                    </Group>
                ))}
            </Nav>
        </StyledSideBar>
    )
}
