import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/server.js'
import { API, renderPage, springPage } from '@/test/utils.jsx'
import UsersPage from './UsersPage.jsx'

const user = (id, overrides = {}) => ({
    id,
    name: `Usuário ${id}`,
    email: `u${id}@doabem.local`,
    role: 'OPERATOR',
    active: true,
    createdAt: '2026-11-01T09:00:00',
    ...overrides,
})

const list = (rows) => http.get(`${API}/users`, () => HttpResponse.json(springPage(rows)))

describe('UsersPage', () => {
    it('lista usuários com nome, e-mail e perfil', async () => {
        server.use(list([user(1, { name: 'Ana Admin', role: 'COORDINATOR' }), user(2)]))
        renderPage(<UsersPage />)
        expect(await screen.findByText('Ana Admin')).toBeInTheDocument()
        expect(screen.getByText('u2@doabem.local')).toBeInTheDocument()
    })

    it('busca filtra por nome e e-mail no cliente', async () => {
        server.use(list([user(1, { name: 'Ana Lima' }), user(2, { name: 'Bruno Dias' })]))
        renderPage(<UsersPage />)
        await screen.findByText('Ana Lima')
        await userEvent.type(screen.getByRole('searchbox'), 'bruno')
        await waitFor(() => expect(screen.queryByText('Ana Lima')).not.toBeInTheDocument())
        expect(screen.getByText('Bruno Dias')).toBeInTheDocument()
    })

    it('403 do backend aparece como mensagem de permissão', async () => {
        server.use(
            http.get(`${API}/users`, () =>
                HttpResponse.json({ status: 403, message: 'Acesso negado.' }, { status: 403 }),
            ),
        )
        renderPage(<UsersPage />)
        expect(await screen.findByText('Acesso negado.')).toBeInTheDocument()
    })

    describe('novo usuário', () => {
        const fill = async (dialog, { name, email, password }) => {
            await userEvent.type(within(dialog).getByLabelText('Nome'), name)
            await userEvent.type(within(dialog).getByLabelText('E-mail (login)'), email)
            await userEvent.type(within(dialog).getByLabelText('Senha inicial'), password)
            await userEvent.click(within(dialog).getByRole('combobox', { name: /perfil/i }))
            await userEvent.click(await screen.findByRole('option', { name: /operador/i }))
        }

        const open = async () => {
            server.use(list([user(1)]))
            renderPage(<UsersPage />)
            await screen.findByText('Usuário 1')
            await userEvent.click(screen.getByRole('button', { name: /novo usuário/i }))
            return screen.findByRole('dialog')
        }

        it('salvar envia POST /users com os campos e recarrega a lista', async () => {
            let body
            let loads = 0
            server.use(
                http.get(`${API}/users`, () => {
                    loads += 1
                    return HttpResponse.json(springPage([user(1)]))
                }),
                http.post(`${API}/users`, async ({ request }) => {
                    body = await request.json()
                    return HttpResponse.json(user(2, body), { status: 201 })
                }),
            )
            renderPage(<UsersPage />)
            await screen.findByText('Usuário 1')
            await userEvent.click(screen.getByRole('button', { name: /novo usuário/i }))
            const dialog = await screen.findByRole('dialog')
            await fill(dialog, {
                name: 'Novo Nome',
                email: 'novo@doabem.local',
                password: 'senha1234',
            })
            await userEvent.click(within(dialog).getByRole('button', { name: /salvar/i }))

            await waitFor(() => expect(body).toBeDefined())
            expect(body).toEqual({
                name: 'Novo Nome',
                email: 'novo@doabem.local',
                password: 'senha1234',
                role: 'OPERATOR',
            })
            await waitFor(() => expect(loads).toBeGreaterThanOrEqual(2))
        })

        it('senha curta é barrada no cliente', async () => {
            let posted = false
            const dialog = await open()
            server.use(
                http.post(
                    `${API}/users`,
                    () => ((posted = true), HttpResponse.json({}, { status: 201 })),
                ),
            )
            await fill(dialog, { name: 'X', email: 'x@doabem.local', password: '123' })
            await userEvent.click(within(dialog).getByRole('button', { name: /salvar/i }))
            expect(
                await within(dialog).findByText(/entre 8 e 72|8 caracteres/i, { selector: 'span' }),
            ).toBeInTheDocument()
            expect(posted).toBe(false)
        })

        it('e-mail duplicado (409) mostra a mensagem e mantém o modal aberto', async () => {
            const dialog = await open()
            server.use(
                http.post(`${API}/users`, () =>
                    HttpResponse.json(
                        { status: 409, message: 'Já existe um usuário com este e-mail.' },
                        { status: 409 },
                    ),
                ),
            )
            await fill(dialog, { name: 'X', email: 'dup@doabem.local', password: 'senha1234' })
            await userEvent.click(within(dialog).getByRole('button', { name: /salvar/i }))
            expect(
                await within(dialog).findByText('Já existe um usuário com este e-mail.'),
            ).toBeInTheDocument()
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        it('fieldErrors do backend marcam o campo', async () => {
            const dialog = await open()
            server.use(
                http.post(`${API}/users`, () =>
                    HttpResponse.json(
                        {
                            status: 400,
                            message: 'Revise os campos destacados.',
                            fieldErrors: { email: 'E-mail inválido.' },
                        },
                        { status: 400 },
                    ),
                ),
            )
            await fill(dialog, { name: 'X', email: 'ok@doabem.local', password: 'senha1234' })
            await userEvent.click(within(dialog).getByRole('button', { name: /salvar/i }))
            expect(await within(dialog).findByText('E-mail inválido.')).toBeInTheDocument()
        })
    })

    describe('ativar e desativar', () => {
        it('desativar chama PATCH /users/{id}/status com active=false', async () => {
            let body
            server.use(
                list([user(2, { name: 'Outro Usuário' })]),
                http.patch(`${API}/users/2/status`, async ({ request }) => {
                    body = await request.json()
                    return HttpResponse.json(user(2, { active: false }))
                }),
            )
            renderPage(<UsersPage />)
            await screen.findByText('Outro Usuário')
            await userEvent.click(screen.getByRole('button', { name: 'Desativar' }))
            const confirm = await screen.findByRole('dialog')
            await userEvent.click(within(confirm).getByRole('button', { name: 'Desativar' }))
            await waitFor(() => expect(body).toEqual({ active: false }))
        })

        it('reativar envia active=true', async () => {
            let body
            server.use(
                list([user(2, { name: 'Maria Reativar', active: false })]),
                http.patch(`${API}/users/2/status`, async ({ request }) => {
                    body = await request.json()
                    return HttpResponse.json(user(2))
                }),
            )
            renderPage(<UsersPage />)
            await screen.findByText('Maria Reativar')
            await userEvent.click(screen.getByRole('button', { name: 'Reativar' }))
            const confirm = await screen.findByRole('dialog')
            await userEvent.click(within(confirm).getByRole('button', { name: 'Reativar' }))
            await waitFor(() => expect(body).toEqual({ active: true }))
        })

        it('o próprio usuário logado não tem botão de desativar', async () => {
            server.use(list([user(1, { name: 'Eu Mesmo', email: 'tester@doabem.local' })]))
            renderPage(<UsersPage />)
            await screen.findByText('Eu Mesmo')
            expect(screen.queryByRole('button', { name: 'Desativar' })).not.toBeInTheDocument()
        })

        it('erro do backend ao desativar mostra a mensagem', async () => {
            server.use(
                list([user(2, { name: 'Outro' })]),
                http.patch(`${API}/users/2/status`, () =>
                    HttpResponse.json(
                        { status: 409, message: 'Não é possível desativar.' },
                        { status: 409 },
                    ),
                ),
            )
            renderPage(<UsersPage />)
            await screen.findByText('Outro')
            await userEvent.click(screen.getByRole('button', { name: 'Desativar' }))
            const confirm = await screen.findByRole('dialog')
            await userEvent.click(within(confirm).getByRole('button', { name: 'Desativar' }))
            expect(await screen.findByText('Não é possível desativar.')).toBeInTheDocument()
        })
    })
})
