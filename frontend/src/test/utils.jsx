import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeProvider.jsx'
import { AuthProvider } from '@/contexts/AuthProvider.jsx'
import { ToastProvider } from '@/contexts/ToastProvider.jsx'
import { saveSession } from '@/services/sessionStorageService.js'

export const API = 'http://localhost/api'

export const createTestClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0, staleTime: 30_000, refetchOnWindowFocus: false },
            mutations: { retry: false },
        },
    })

export const signInAs = (role = 'COORDINATOR') =>
    saveSession({
        token: 'test-token',
        expiresAt: Date.now() + 3_600_000,
        user: { name: 'Tester', email: 'tester@doabem.local', role },
    })

export const createWrapper = (client = createTestClient(), { route = '/' } = {}) => {
    const Wrapper = ({ children }) => (
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={[route]}>
                <ToastProvider>
                    <AuthProvider>{children}</AuthProvider>
                </ToastProvider>
            </MemoryRouter>
        </QueryClientProvider>
    )
    return Wrapper
}

export const renderHookWithProviders = (hook, options = {}) => {
    const client = options.client ?? createTestClient()
    return {
        client,
        ...renderHook(hook, { wrapper: createWrapper(client, options), ...options }),
    }
}

export const springPage = (content, { page = 0, size = 1000 } = {}) => ({
    content,
    page: { size, number: page, totalElements: content.length, totalPages: content.length ? 1 : 0 },
})

export const renderPage = (page, { role = 'COORDINATOR', route = '/' } = {}) => {
    signInAs(role)
    const client = createTestClient()
    const Wrapper = createWrapper(client, { route })
    return {
        client,
        ...render(
            <ThemeProvider>
                <Wrapper>{page}</Wrapper>
            </ThemeProvider>,
        ),
    }
}
