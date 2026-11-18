import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { queryClient } from '@/lib/queryClient.js'
import { server } from './server.js'

// jsdom não implementa matchMedia (usado pelo tema).
window.matchMedia ??= (query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
})

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
    cleanup()
    server.resetHandlers()
    queryClient.clear()
    sessionStorage.clear()
    vi.restoreAllMocks()
})

afterAll(() => server.close())
