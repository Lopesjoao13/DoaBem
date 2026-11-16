import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '@/contexts/AuthProvider.jsx'
import { ThemeProvider } from '@/contexts/ThemeProvider.jsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { loadSession } from '@/services/sessionStorageService.js'
import { server } from '@/test/server.js'
import { API, createTestClient } from '@/test/utils.jsx'
import LoginPage from './LoginPage.jsx'

const renderLogin = () =>
    render(
        <QueryClientProvider client={createTestClient()}>
            <ThemeProvider>
                <MemoryRouter initialEntries={['/login']}>
                    <AuthProvider>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/dashboard" element={<p>Painel carregado</p>} />
                        </Routes>
                    </AuthProvider>
                </MemoryRouter>
            </ThemeProvider>
        </QueryClientProvider>,
    )

const loginResponse = {
    accessToken: 'jwt-123',
    tokenType: 'Bearer',
    expiresIn: 3600,
    name: 'Coordenador Demo',
    role: 'COORDINATOR',
}

describe('LoginPage', () => {
    it('validação: campos vazios mostram os erros e não chamam a API', async () => {
        let called = false
        server.use(
            http.post(
                `${API}/auth/login`,
                () => ((called = true), HttpResponse.json(loginResponse)),
            ),
        )
        renderLogin()
        await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
        expect(await screen.findByText('Informe o e-mail.')).toBeInTheDocument()
        expect(screen.getByText('Informe a senha.')).toBeInTheDocument()
        expect(called).toBe(false)
    })

    it('e-mail inválido é rejeitado antes de chamar a API', async () => {
        renderLogin()
        await userEvent.type(screen.getByLabelText('E-mail'), 'sem-arroba')
        await userEvent.type(screen.getByLabelText('Senha'), 'qualquer')
        await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
        expect(await screen.findByText('Informe um e-mail válido.')).toBeInTheDocument()
    })

    it('login correto grava a sessão e vai para o dashboard', async () => {
        let body
        server.use(
            http.post(`${API}/auth/login`, async ({ request }) => {
                body = await request.json()
                return HttpResponse.json(loginResponse)
            }),
        )
        renderLogin()
        await userEvent.type(screen.getByLabelText('E-mail'), 'Coordenador@DoaBem.local')
        await userEvent.type(screen.getByLabelText('Senha'), 'Doabem@123')
        await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

        expect(await screen.findByText('Painel carregado')).toBeInTheDocument()
        expect(body).toEqual({ email: 'coordenador@doabem.local', password: 'Doabem@123' })
        expect(loadSession()).toMatchObject({
            token: 'jwt-123',
            user: { name: 'Coordenador Demo', role: 'COORDINATOR' },
        })
    })

    it('credenciais erradas mostram a mensagem do backend e permanecem na tela', async () => {
        server.use(
            http.post(`${API}/auth/login`, () =>
                HttpResponse.json(
                    { status: 401, message: 'E-mail ou senha inválidos.' },
                    { status: 401 },
                ),
            ),
        )
        renderLogin()
        await userEvent.type(screen.getByLabelText('E-mail'), 'a@b.co')
        await userEvent.type(screen.getByLabelText('Senha'), 'errada')
        await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

        expect(await screen.findByText('E-mail ou senha inválidos.')).toBeInTheDocument()
        expect(screen.queryByText('Painel carregado')).not.toBeInTheDocument()
        expect(loadSession()).toBeNull()
        await waitFor(() => expect(screen.getByRole('button', { name: /entrar/i })).toBeEnabled())
    })

    it('servidor fora do ar mostra a mensagem de rede', async () => {
        server.use(http.post(`${API}/auth/login`, () => HttpResponse.error()))
        renderLogin()
        await userEvent.type(screen.getByLabelText('E-mail'), 'a@b.co')
        await userEvent.type(screen.getByLabelText('Senha'), 'qualquer')
        await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
        expect(await screen.findByText(/não foi possível conectar/i)).toBeInTheDocument()
    })
})
