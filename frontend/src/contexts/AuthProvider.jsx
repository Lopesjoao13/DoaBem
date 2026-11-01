import { useCallback, useMemo, useState } from 'react'
import { USE_MOCK } from '@/constants/api.js'
import { clearSession, loadSession, saveSession } from '@/services/sessionStorageService.js'
import { AuthContext } from './AuthContext.js'

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(loadSession)

    const signIn = useCallback((newSession) => {
        saveSession(newSession)
        setSession(newSession)
    }, [])

    const switchRole = useCallback((role) => {
        if (!USE_MOCK) return
        setSession((current) => {
            const next = { ...current, user: { ...current.user, role } }
            saveSession(next)
            return next
        })
    }, [])

    const signOut = useCallback(() => {
        clearSession()
        setSession(null)
    }, [])

    const value = useMemo(
        () => ({
            user: session?.user ?? null,
            token: session?.token ?? null,
            isAuthenticated: Boolean(session),
            signIn,
            signOut,
            switchRole,
        }),
        [session, signIn, signOut, switchRole],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
