export const loadPreference = (key, fallback) => {
    try {
        const stored = localStorage.getItem(key)
        return stored === null ? fallback : JSON.parse(stored)
    } catch (error) {
        console.error('Falha ao ler a preferência:', error.message)
        return fallback
    }
}

export const savePreference = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
        console.error('Falha ao salvar a preferência:', error.message)
    }
}
