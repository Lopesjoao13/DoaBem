import { DARK_SCHEME_QUERY, THEMES } from '@/constants/theme.js'
import { STORAGE_KEYS } from '@/constants/storageKeys.js'
import { loadPreference } from '@/services/preferencesStorageService.js'

const isValidTheme = (value) => Object.values(THEMES).includes(value)

export const loadThemePreference = () => {
    const stored = loadPreference(STORAGE_KEYS.THEME, THEMES.SYSTEM)
    return isValidTheme(stored) ? stored : THEMES.SYSTEM
}

export const resolveTheme = (preference) => {
    if (preference !== THEMES.SYSTEM) return preference
    return window.matchMedia(DARK_SCHEME_QUERY).matches ? THEMES.DARK : THEMES.LIGHT
}

export const applyTheme = (preference) => {
    document.documentElement.dataset.theme = resolveTheme(preference)
}
