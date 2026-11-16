import { IconCheck } from '@tabler/icons-react'
import { THEME_LABELS, THEMES } from '@/constants/theme.js'
import { useTheme } from '@/hooks/useTheme.js'
import { Item, Mark } from '@/components/TopBar/components/UserMenu/UserMenu.styles.js'

export const ThemeOptions = () => {
    const { theme, setTheme } = useTheme()

    return (
        <div role="group" aria-label="Tema">
            {Object.values(THEMES).map((value) => (
                <Item
                    key={value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={theme === value}
                    $isSelected={theme === value}
                    onClick={() => setTheme(value)}
                >
                    <Mark />
                    {THEME_LABELS[value]}
                    {theme === value && <IconCheck size={16} stroke={2} />}
                </Item>
            ))}
        </div>
    )
}
