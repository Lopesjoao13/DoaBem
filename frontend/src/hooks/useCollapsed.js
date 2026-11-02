import { useCallback, useState } from 'react'
import { loadPreference, savePreference } from '@/services/preferencesStorageService.js'

export const useCollapsed = (storageKey) => {
    const [isCollapsed, setIsCollapsed] = useState(() => loadPreference(storageKey, false) === true)

    const toggle = useCallback(() => {
        setIsCollapsed((current) => {
            savePreference(storageKey, !current)
            return !current
        })
    }, [storageKey])

    return { isCollapsed, toggle }
}
