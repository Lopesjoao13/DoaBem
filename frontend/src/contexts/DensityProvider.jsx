import { useCallback, useEffect, useMemo, useState } from 'react'
import { DENSITIES } from '@/constants/density.js'
import { STORAGE_KEYS } from '@/constants/storageKeys.js'
import { savePreference } from '@/services/preferencesStorageService.js'
import { applyDensity, loadDensity } from '@/utils/density.js'
import { DensityContext } from './DensityContext.js'

export const DensityProvider = ({ children }) => {
    const [density, setDensityState] = useState(loadDensity)

    useEffect(() => {
        applyDensity(density)
    }, [density])

    const toggleDensity = useCallback(() => {
        setDensityState((current) => {
            const next = current === DENSITIES.COMPACT ? DENSITIES.COMFORTABLE : DENSITIES.COMPACT
            savePreference(STORAGE_KEYS.DENSITY, next)
            return next
        })
    }, [])

    const value = useMemo(
        () => ({ density, isCompact: density === DENSITIES.COMPACT, toggleDensity }),
        [density, toggleDensity],
    )

    return <DensityContext.Provider value={value}>{children}</DensityContext.Provider>
}
