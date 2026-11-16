import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '@/contexts/AuthProvider.jsx'
import { ThemeProvider } from '@/contexts/ThemeProvider.jsx'
import { ToastProvider } from '@/contexts/ToastProvider.jsx'
import { server } from '@/test/server.js'
import { API, createTestClient, signInAs, springPage } from '@/test/utils.jsx'
import FamiliesPage from './FamiliesPage.jsx'

const family = (id, overrides = {}) => ({
    id,
    responsibleName: `Família ${id}`,
    phone: null,
    neighborhood: 'Centro',
    householdSize: 3,
    notes: null,
    status: 'ACTIVE',
    createdAt: '2026-11-10T10:00:00',
    ...overrides,
})

const renderPage = (route = '/familias') => {
    signInAs('COORDINATOR')
    return render(
        <QueryClientProvider client={createTestClient()}>
            <ThemeProvider>
                <ToastProvider>
                    <MemoryRouter initialEntries={[route]}>
                        <AuthProvider>
                            <FamiliesPage />
                        </AuthProvider>
                    </MemoryRouter>
                </ToastProvider>
            </ThemeProvider>
        </QueryClientProvider>,
    )
}

const listWith = (rows, onRequest) =>
    http.get(`${API}/beneficiaries`, ({ request }) => {
        onRequest?.(new URL(request.url).searchParams)
        return HttpResponse.json(springPage(rows))
    })

describe('FamiliesPage', () => {
    it('carrega e lista as famílias da API', async () => {
        server.use(
            listWith([
                family(1),
                family(2, { responsibleName: 'Maria Souza', neighborhood: 'Boa Vista' }),
            ]),
        )
        renderPage()
        expect(await screen.findByText('Maria Souza')).toBeInTheDocument()
        expect(screen.getByText('Família 1')).toBeInTheDocument()
        expect(screen.getByText('Boa Vista')).toBeInTheDocument()
    })

    it('pede a lista completa com o filtro de situação padrão', async () => {
        let params
        server.use(listWith([], (search) => (params = search)))
        renderPage()
        await screen.findByText(/nenhuma família encontrada/i)
        expect(params.get('size')).toBe('1000')
        expect(params.get('page')).toBe('0')
    })

    it('estado vazio', async () => {
        server.use(listWith([]))
        renderPage()
        expect(await screen.findByText('Nenhuma família encontrada')).toBeInTheDocument()
    })

    it('erro do servidor mostra a mensagem e "Tentar novamente" recarrega', async () => {
        let calls = 0
        server.use(
            http.get(`${API}/beneficiaries`, () => {
                calls += 1
                return calls === 1
                    ? HttpResponse.json({ status: 500, message: 'Falha interna' }, { status: 500 })
                    : HttpResponse.json(springPage([family(7, { responsibleName: 'Recuperada' })]))
            }),
        )
        renderPage()
        expect(await screen.findByText('Falha interna')).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))
        expect(await screen.findByText('Recuperada')).toBeInTheDocument()
    })

    it('busca filtra por nome, telefone e bairro', async () => {
        server.use(
            listWith([
                family(1, { responsibleName: 'Ana Lima', neighborhood: 'Centro' }),
                family(2, {
                    responsibleName: 'Bruno Costa',
                    neighborhood: 'Itaum',
                    phone: '47999',
                }),
            ]),
        )
        renderPage()
        await screen.findByText('Ana Lima')
        const search = screen.getByPlaceholderText('Nome do responsável')
        await userEvent.type(search, 'itaum')
        await waitFor(() => expect(screen.queryByText('Ana Lima')).not.toBeInTheDocument())
        expect(screen.getByText('Bruno Costa')).toBeInTheDocument()
    })

    describe('modal "Nova família"', () => {
        const openDialog = async () => {
            await userEvent.click(screen.getByRole('button', { name: /nova família/i }))
            return screen.findByRole('dialog')
        }

        it('todos os campos aceitam digitação, inclusive Bairro / localidade', async () => {
            server.use(listWith([]))
            renderPage()
            await screen.findByText('Nenhuma família encontrada')
            const dialog = await openDialog()

            const name = within(dialog).getByLabelText('Nome do responsável')
            const phone = within(dialog).getByLabelText('Telefone (opcional)')
            const size = within(dialog).getByLabelText('Nº de integrantes')
            const neighborhood = within(dialog).getByLabelText('Bairro / localidade (opcional)')
            const notes = within(dialog).getByLabelText(/Observações/)

            await userEvent.type(name, 'Joana Prado')
            await userEvent.type(phone, '47988887777')
            await userEvent.type(size, '5')
            await userEvent.type(neighborhood, 'Bairro Novo')
            await userEvent.type(notes, 'Precisa de cesta')

            expect(name).toHaveValue('Joana Prado')
            expect(phone).toHaveValue('47988887777')
            expect(size).toHaveValue('5')
            expect(neighborhood).toHaveValue('Bairro Novo')
            expect(notes).toHaveValue('Precisa de cesta')
        })

        it('o campo Bairro não é somente leitura nem desabilitado e recebe foco ao clicar', async () => {
            server.use(listWith([]))
            renderPage()
            await screen.findByText('Nenhuma família encontrada')
            const dialog = await openDialog()
            const neighborhood = within(dialog).getByLabelText('Bairro / localidade (opcional)')

            expect(neighborhood).toBeEnabled()
            expect(neighborhood).not.toHaveAttribute('readonly')
            await userEvent.click(neighborhood)
            expect(neighborhood).toHaveFocus()
        })

        it('digitar em um campo não reinicia o formulário (valores anteriores permanecem)', async () => {
            server.use(listWith([]))
            renderPage()
            await screen.findByText('Nenhuma família encontrada')
            const dialog = await openDialog()
            await userEvent.type(within(dialog).getByLabelText('Nome do responsável'), 'Carlos')
            await userEvent.type(
                within(dialog).getByLabelText('Bairro / localidade (opcional)'),
                'Norte',
            )
            await userEvent.type(within(dialog).getByLabelText('Telefone (opcional)'), '123')
            expect(within(dialog).getByLabelText('Nome do responsável')).toHaveValue('Carlos')
            expect(within(dialog).getByLabelText('Bairro / localidade (opcional)')).toHaveValue(
                'Norte',
            )
        })

        it('salvar envia o corpo correto (POST /beneficiaries) e abre o detalhe da família criada', async () => {
            let created
            const saved = family(42, {
                responsibleName: 'Joana Prado',
                householdSize: 5,
                neighborhood: 'Bairro Novo',
            })
            server.use(
                listWith([]),
                http.post(`${API}/beneficiaries`, async ({ request }) => {
                    created = await request.json()
                    return HttpResponse.json(saved, { status: 201 })
                }),
                http.get(`${API}/beneficiaries/42`, () => HttpResponse.json(saved)),
                http.get(`${API}/beneficiaries/42/requests`, () =>
                    HttpResponse.json({ requests: [], deliveries: [] }),
                ),
                http.get(`${API}/beneficiaries/42/delivery-summary`, () =>
                    HttpResponse.json({ lastDelivery: null, recentDeliveries: [] }),
                ),
            )
            renderPage()
            await screen.findByText('Nenhuma família encontrada')
            const dialog = await openDialog()
            await userEvent.type(
                within(dialog).getByLabelText('Nome do responsável'),
                'Joana Prado',
            )
            await userEvent.type(within(dialog).getByLabelText('Nº de integrantes'), '5')
            await userEvent.type(
                within(dialog).getByLabelText('Bairro / localidade (opcional)'),
                'Bairro Novo',
            )
            await userEvent.click(within(dialog).getByRole('button', { name: /salvar família/i }))

            await waitFor(() => expect(created).toBeDefined())
            expect(created).toMatchObject({
                responsibleName: 'Joana Prado',
                householdSize: 5,
                neighborhood: 'Bairro Novo',
            })
            expect(await screen.findByText(/Joana Prado/)).toBeInTheDocument()
        })

        it('validação: nome vazio e integrantes inválidos não chamam a API', async () => {
            let posted = false
            server.use(
                listWith([]),
                http.post(
                    `${API}/beneficiaries`,
                    () => ((posted = true), HttpResponse.json({}, { status: 201 })),
                ),
            )
            renderPage()
            await screen.findByText('Nenhuma família encontrada')
            const dialog = await openDialog()
            await userEvent.type(within(dialog).getByLabelText('Nº de integrantes'), '0')
            await userEvent.click(within(dialog).getByRole('button', { name: /salvar família/i }))

            expect(
                await within(dialog).findAllByText(/obrigat|informe|inteiro|maior/i),
            ).not.toHaveLength(0)
            expect(posted).toBe(false)
        })

        it('erro do backend aparece no formulário e o modal continua aberto', async () => {
            server.use(
                listWith([]),
                http.post(`${API}/beneficiaries`, () =>
                    HttpResponse.json(
                        {
                            status: 400,
                            message: 'Revise os campos destacados.',
                            fieldErrors: { responsibleName: 'Informe o nome do responsável.' },
                        },
                        { status: 400 },
                    ),
                ),
            )
            renderPage()
            await screen.findByText('Nenhuma família encontrada')
            const dialog = await openDialog()
            await userEvent.type(within(dialog).getByLabelText('Nome do responsável'), 'X')
            await userEvent.type(within(dialog).getByLabelText('Nº de integrantes'), '2')
            await userEvent.click(within(dialog).getByRole('button', { name: /salvar família/i }))

            expect(
                await within(dialog).findByText('Revise os campos destacados.'),
            ).toBeInTheDocument()
            expect(within(dialog).getByText('Informe o nome do responsável.')).toBeInTheDocument()
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        it('Cancelar fecha o modal sem chamar a API', async () => {
            server.use(listWith([]))
            renderPage()
            await screen.findByText('Nenhuma família encontrada')
            const dialog = await openDialog()
            await userEvent.click(within(dialog).getByRole('button', { name: /cancelar/i }))
            await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
        })
    })
})
