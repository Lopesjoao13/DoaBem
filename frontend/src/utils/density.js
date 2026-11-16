import { DENSITIES } from '@/constants/density.js'
import { STORAGE_KEYS } from '@/constants/storageKeys.js'
import { loadPreference } from '@/services/preferencesStorageService.js'

export const loadDensity = () => {
    const stored = loadPreference(STORAGE_KEYS.DENSITY, DENSITIES.COMFORTABLE)
    return Object.values(DENSITIES).includes(stored) ? stored : DENSITIES.COMFORTABLE
}

export const applyDensity = (density) => {
    document.documentElement.dataset.density = density
}
