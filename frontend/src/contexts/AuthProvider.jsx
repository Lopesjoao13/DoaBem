import { useCallback, useMemo, useState } from 'react'
import { clearSession, loadSession, saveSession } from '@/services/sessionStorageService.js'
import { AuthContext } from './AuthContext.js'

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(loadSession)

    const signIn = useCallback((newSession) => {
        saveSession(newSession)
        setSession(newSession)
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
        }),
        [session, signIn, signOut],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
