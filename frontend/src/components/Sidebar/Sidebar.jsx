import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-react'
import { Tooltip } from '@/components/Tooltip/Tooltip.jsx'
import { TOOLTIP_PLACEMENTS } from '@/constants/tooltip.js'
import { useAuth } from '@/hooks/useAuth.js'
import { useSidebarGroups } from '@/hooks/useSidebarGroups.js'
import {
    Group,
    GroupDivider,
    GroupTitle,
    Label,
    Nav,
    NavItem,
    StyledSidebar,
    ToggleButton,
} from './Sidebar.styles.js'

const CollapsibleTooltip = ({ isCollapsed, label, children }) =>
    isCollapsed ? (
        <Tooltip content={label} placement={TOOLTIP_PLACEMENTS.RIGHT} isBlock>
            {children}
        </Tooltip>
    ) : (
        children
    )

export const Sidebar = ({ isCollapsed, onToggle }) => {
    const { user } = useAuth()
    const groups = useSidebarGroups(user.role)
    const ToggleIcon = isCollapsed ? IconLayoutSidebarLeftExpand : IconLayoutSidebarLeftCollapse
    const toggleLabel = isCollapsed ? 'Expandir menu' : 'Recolher menu'

    return (
        <StyledSidebar $isCollapsed={isCollapsed}>
            <Nav aria-label="Navegação principal">
                {groups.map(({ title, items }) => (
                    <Group key={title}>
                        {isCollapsed ? <GroupDivider /> : <GroupTitle>{title}</GroupTitle>}
                        {items.map(({ label, path, icon: Icon }) => (
                            <CollapsibleTooltip key={path} isCollapsed={isCollapsed} label={label}>
                                <NavItem to={path} aria-label={label} $isCollapsed={isCollapsed}>
                                    <Icon size={18} stroke={2} />
                                    {!isCollapsed && <Label>{label}</Label>}
                                </NavItem>
                            </CollapsibleTooltip>
                        ))}
                    </Group>
                ))}
            </Nav>
            <CollapsibleTooltip isCollapsed={isCollapsed} label={toggleLabel}>
                <ToggleButton
                    type="button"
                    onClick={onToggle}
                    aria-label={toggleLabel}
                    aria-expanded={!isCollapsed}
                    $isCollapsed={isCollapsed}
                >
                    <ToggleIcon size={18} stroke={2} />
                    {!isCollapsed && <Label>Recolher menu</Label>}
                </ToggleButton>
            </CollapsibleTooltip>
        </StyledSidebar>
    )
}
