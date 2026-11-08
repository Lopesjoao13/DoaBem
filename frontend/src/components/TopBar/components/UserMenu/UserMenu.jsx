import {
    IconCheck,
    IconChevronDown,
    IconChevronRight,
    IconLayoutList,
    IconLogout,
    IconMoon,
    IconSun,
} from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import { USE_MOCK } from '@/constants/api.js'
import { ROLE_LABELS } from '@/constants/roles.js'
import { THEMES } from '@/constants/theme.js'
import { useAuth } from '@/hooks/useAuth.js'
import { resolveTheme } from '@/utils/theme.js'
import { useDensity } from '@/hooks/useDensity.js'
import { useTheme } from '@/hooks/useTheme.js'
import { RoleOptions } from '@/components/TopBar/components/UserMenu/components/RoleOptions/RoleOptions.jsx'
import { ThemeOptions } from '@/components/TopBar/components/UserMenu/components/ThemeOptions/ThemeOptions.jsx'
import {
    Avatar,
    Divider,
    Email,
    Header,
    Identity,
    Item,
    Name,
    Panel,
    Trigger,
    UserName,
    UserRole,
    Wrapper,
} from './UserMenu.styles.js'

export const UserMenu = () => {
    const { user, signOut } = useAuth()
    const { theme } = useTheme()
    const { isCompact, toggleDensity } = useDensity()
    const wrapperRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)
    const [isThemeOpen, setIsThemeOpen] = useState(false)

    useEffect(() => {
        if (!isOpen) return undefined
        const handleOutside = (event) => {
            if (!wrapperRef.current.contains(event.target)) setIsOpen(false)
        }
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setIsOpen(false)
        }
        document.addEventListener('mousedown', handleOutside)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('mousedown', handleOutside)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen])

    const ThemeIcon = resolveTheme(theme) === THEMES.DARK ? IconMoon : IconSun

    return (
        <Wrapper ref={wrapperRef}>
            <Trigger
                type="button"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((current) => !current)}
            >
                <Avatar aria-hidden="true">{user.name.charAt(0)}</Avatar>
                <Identity>
                    <UserName>{user.name}</UserName>
                    <UserRole>{ROLE_LABELS[user.role]}</UserRole>
                </Identity>
                <IconChevronDown size={16} stroke={2} aria-hidden="true" />
            </Trigger>
            {isOpen && (
                <Panel role="menu" aria-label="Menu do usuário">
                    <Header>
                        <Name>{user.name}</Name>
                        <Email>{user.email}</Email>
                    </Header>
                    <Divider />
                    <Item
                        type="button"
                        role="menuitem"
                        aria-expanded={isThemeOpen}
                        onClick={() => setIsThemeOpen((current) => !current)}
                    >
                        <ThemeIcon size={18} stroke={2} />
                        Tema
                        {isThemeOpen ? (
                            <IconChevronDown size={16} stroke={2} />
                        ) : (
                            <IconChevronRight size={16} stroke={2} />
                        )}
                    </Item>
                    {isThemeOpen && <ThemeOptions />}
                    <Item
                        type="button"
                        role="menuitemcheckbox"
                        aria-checked={isCompact}
                        onClick={toggleDensity}
                    >
                        <IconLayoutList size={18} stroke={2} />
                        Tabelas compactas
                        {isCompact && <IconCheck size={16} stroke={2} />}
                    </Item>
                    {USE_MOCK && (
                        <>
                            <Divider />
                            <RoleOptions />
                        </>
                    )}
                    <Divider />
                    <Item type="button" role="menuitem" onClick={signOut}>
                        <IconLogout size={18} stroke={2} />
                        Sair
                    </Item>
                </Panel>
            )}
        </Wrapper>
    )
}
