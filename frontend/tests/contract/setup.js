import { vi } from 'vitest'

// Ambiente Node: o httpClient usa sessionStorage e window.location (redirecionamento no 401).
const createStorage = () => {
    const data = new Map()
    return {
        getItem: (key) => (data.has(key) ? data.get(key) : null),
        setItem: (key, value) => data.set(key, String(value)),
        removeItem: (key) => data.delete(key),
        clear: () => data.clear(),
    }
}

globalThis.sessionStorage = createStorage()
globalThis.localStorage = createStorage()
globalThis.window = { location: { assign: vi.fn() } }
