import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/server.js'
import { API, renderPage, springPage } from '@/test/utils.jsx'
import EntriesPage from './EntriesPage.jsx'

const entry = (id, overrides = {}) => ({
    id,
    entryDate: '2026-11-10',
    source: `Doador ${id}`,
    anonymous: false,
    registeredBy: 'Coordenador Demo',
    createdAt: '2026-11-10T10:00:00',
    receivedItems: [{ itemId: id, itemName: `Item ${id}` }],
    ...overrides,
})

describe('EntriesPage', () => {
    it('lista as entradas da API', async () => {
        server.use(
            http.get(`${API}/donation-entries`, () =>
                HttpResponse.json(springPage([entry(1), entry(2)])),
            ),
        )
        renderPage(<EntriesPage />)
        expect(await screen.findByText(/Doador 1/)).toBeInTheDocument()
        expect(screen.getByText(/Doador 2/)).toBeInTheDocument()
    })

    it('pede a lista completa (page=0, size=1000)', async () => {
        let params
        server.use(
            http.get(`${API}/donation-entries`, ({ request }) => {
                params = new URL(request.url).searchParams
                return HttpResponse.json(springPage([]))
            }),
        )
        renderPage(<EntriesPage />)
        await screen.findByText(/nenhuma entrada/i)
        expect(params.get('size')).toBe('1000')
    })

    it('busca por origem filtra no cliente', async () => {
        server.use(
            http.get(`${API}/donation-entries`, () =>
                HttpResponse.json(
                    springPage([
                        entry(1, { source: 'Mercado Central' }),
                        entry(2, { source: 'Padaria' }),
                    ]),
                ),
            ),
        )
        renderPage(<EntriesPage />)
        await screen.findByText(/Mercado Central/)
        await userEvent.type(screen.getByPlaceholderText('Origem ou nº da entrada'), 'padaria')
        await waitFor(() => expect(screen.queryByText(/Mercado Central/)).not.toBeInTheDocument())
        expect(screen.getByText(/Padaria/)).toBeInTheDocument()
    })

    it('filtro "Item recebido" funciona com itemId numérico vindo do backend', async () => {
        server.use(
            http.get(`${API}/donation-entries`, () =>
                HttpResponse.json(
                    springPage([
                        entry(1, {
                            source: 'Só arroz',
                            receivedItems: [{ itemId: 10, itemName: 'Arroz' }],
                        }),
                        entry(2, {
                            source: 'Só feijão',
                            receivedItems: [{ itemId: 20, itemName: 'Feijão' }],
                        }),
                    ]),
                ),
            ),
        )
        renderPage(<EntriesPage />)
        await screen.findByText(/Só arroz/)
        await userEvent.click(screen.getByRole('combobox', { name: /item recebido/i }))
        await userEvent.click(await screen.findByRole('option', { name: 'Feijão' }))

        await waitFor(() => expect(screen.queryByText(/Só arroz/)).not.toBeInTheDocument())
        expect(screen.getByText(/Só feijão/)).toBeInTheDocument()
    })

    it('resposta sem receivedItems não quebra a tela', async () => {
        server.use(
            http.get(`${API}/donation-entries`, () =>
                HttpResponse.json(springPage([entry(1, { receivedItems: undefined })])),
            ),
        )
        renderPage(<EntriesPage />)
        expect(await screen.findByText(/Doador 1/)).toBeInTheDocument()
    })

    it('erro do servidor é exibido', async () => {
        server.use(
            http.get(`${API}/donation-entries`, () =>
                HttpResponse.json({ status: 500, message: 'Erro ao listar' }, { status: 500 }),
            ),
        )
        renderPage(<EntriesPage />)
        expect(await screen.findByText('Erro ao listar')).toBeInTheDocument()
    })

    it('abrir uma entrada busca o detalhe (GET /donation-entries/{id})', async () => {
        let detailRequested = false
        server.use(
            http.get(`${API}/donation-entries`, () => HttpResponse.json(springPage([entry(5)]))),
            http.get(`${API}/donation-entries/5`, () => {
                detailRequested = true
                return HttpResponse.json({
                    ...entry(5),
                    notes: 'Carga de teste',
                    items: [
                        {
                            id: 1,
                            itemId: 5,
                            itemName: 'Item 5',
                            unitOfMeasure: 'KG',
                            quantity: 12.5,
                            expiryDate: null,
                        },
                    ],
                })
            }),
        )
        renderPage(<EntriesPage />, { route: '/?entrada=5' })
        const dialog = await screen.findByRole('dialog')
        await waitFor(() => expect(detailRequested).toBe(true))
        expect(await within(dialog).findByText('Carga de teste')).toBeInTheDocument()
    })
})
