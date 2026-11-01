import { useCallback, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '@/constants/storageKeys.js'
import { DARK_SCHEME_QUERY, THEMES } from '@/constants/theme.js'
import { savePreference } from '@/services/preferencesStorageService.js'
import { applyTheme, loadThemePreference } from '@/utils/theme.js'
import { ThemeContext } from './ThemeContext.js'

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(loadThemePreference)

    useEffect(() => {
        applyTheme(theme)
        if (theme !== THEMES.SYSTEM) return undefined
        const query = window.matchMedia(DARK_SCHEME_QUERY)
        const handleChange = () => applyTheme(theme)
        query.addEventListener('change', handleChange)
        return () => query.removeEventListener('change', handleChange)
    }, [theme])

    const setTheme = useCallback((nextTheme) => {
        savePreference(STORAGE_KEYS.THEME, nextTheme)
        setThemeState(nextTheme)
    }, [])

    const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
