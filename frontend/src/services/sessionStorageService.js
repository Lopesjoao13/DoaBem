import { STORAGE_KEYS } from '@/constants/storageKeys.js'

const isExpired = (session) => Boolean(session.expiresAt) && session.expiresAt <= Date.now()

export const loadSession = () => {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEYS.SESSION)
        const session = stored ? JSON.parse(stored) : null
        return session && !isExpired(session) ? session : null
    } catch (error) {
        console.error('Falha ao ler a sessão:', error.message)
        return null
    }
}

export const saveSession = (session) => {
    try {
        sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session))
    } catch (error) {
        console.error('Falha ao salvar a sessão:', error.message)
    }
}

export const clearSession = () => {
    try {
        sessionStorage.removeItem(STORAGE_KEYS.SESSION)
    } catch (error) {
        console.error('Falha ao limpar a sessão:', error.message)
    }
}

export const loadMockState = () => {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEYS.MOCK_DB)
        return stored ? JSON.parse(stored) : null
    } catch (error) {
        console.error('Falha ao ler os dados de demonstração:', error.message)
        return null
    }
}

export const saveMockState = (state) => {
    try {
        sessionStorage.setItem(STORAGE_KEYS.MOCK_DB, JSON.stringify(state))
    } catch (error) {
        console.error('Falha ao salvar os dados de demonstração:', error.message)
    }
}
