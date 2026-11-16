import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/server.js'
import { API, renderPage, springPage } from '@/test/utils.jsx'
import MovementsPage from './MovementsPage.jsx'

const movement = (id, overrides = {}) => ({
    id,
    type: 'ENTRY',
    occurredAt: '2026-11-10T10:00:00',
    itemId: 1,
    itemName: `Item ${id}`,
    unitOfMeasure: 'KG',
    quantity: 5,
    userId: 1,
    userName: 'Coordenador Demo',
    adjustmentReason: null,
    reason: null,
    reversesId: null,
    reversedById: null,
    reference: { label: `Entrada #${id} — Mercado`, entryId: id },
    ...overrides,
})

const pageOfMovements = (
    rows,
    { number = 0, totalElements = rows.length, totalPages = 1 } = {},
) => ({
    content: rows,
    page: { size: 10, number, totalElements, totalPages },
})

const baseHandlers = () => [
    http.get(`${API}/items`, () => HttpResponse.json(springPage([{ id: 1, name: 'Arroz' }]))),
    http.get(`${API}/users/options`, () =>
        HttpResponse.json([{ id: 1, name: 'Coordenador Demo' }]),
    ),
]

describe('MovementsPage', () => {
    it('lista movimentações e usa totalElements do formato paginado do Spring', async () => {
        server.use(
            ...baseHandlers(),
            http.get(`${API}/movements`, () =>
                HttpResponse.json(
                    pageOfMovements([movement(1), movement(2)], { totalElements: 2 }),
                ),
            ),
        )
        renderPage(<MovementsPage />)
        expect(await screen.findByText(/Entrada #1/)).toBeInTheDocument()
        expect(screen.getByText(/Entrada #2/)).toBeInTheDocument()
        expect(screen.getByLabelText('Paginação')).toHaveTextContent('Total: 2 registros')
    })

    it('envia size=10 e page=0 na primeira carga', async () => {
        let params
        server.use(
            ...baseHandlers(),
            http.get(`${API}/movements`, ({ request }) => {
                params = new URL(request.url).searchParams
                return HttpResponse.json(pageOfMovements([movement(1)]))
            }),
        )
        renderPage(<MovementsPage />)
        await screen.findByText(/Entrada #1/)
        expect(params.get('size')).toBe('10')
        expect(params.get('page')).toBe('0')
    })

    it('paginação: ir para a página 2 pede page=1 ao backend', async () => {
        const pages = []
        server.use(
            ...baseHandlers(),
            http.get(`${API}/movements`, ({ request }) => {
                const page = Number(new URL(request.url).searchParams.get('page'))
                pages.push(page)
                return HttpResponse.json(
                    pageOfMovements(
                        [
                            movement(page === 0 ? 1 : 11, {
                                reference: {
                                    label: page === 0 ? 'Entrada #1 — A' : 'Entrada #11 — B',
                                },
                            }),
                        ],
                        {
                            number: page,
                            totalElements: 25,
                            totalPages: 3,
                        },
                    ),
                )
            }),
        )
        renderPage(<MovementsPage />)
        await screen.findByText(/Entrada #1 —/)
        await userEvent.click(screen.getByRole('button', { name: '2' }))
        expect(await screen.findByText(/Entrada #11/)).toBeInTheDocument()
        expect(pages).toEqual(expect.arrayContaining([0, 1]))
    })

    it('filtro por tipo envia type na query e volta à página 0', async () => {
        const queries = []
        server.use(
            ...baseHandlers(),
            http.get(`${API}/movements`, ({ request }) => {
                queries.push(Object.fromEntries(new URL(request.url).searchParams))
                return HttpResponse.json(pageOfMovements([movement(1)]))
            }),
        )
        renderPage(<MovementsPage />)
        await screen.findByText(/Entrada #1/)
        await userEvent.click(screen.getByRole('combobox', { name: /tipo/i }))
        await userEvent.click(await screen.findByRole('option', { name: /ajuste/i }))
        await waitFor(() => expect(queries.some((query) => query.type === 'ADJUSTMENT')).toBe(true))
        expect(queries.at(-1)).toMatchObject({ type: 'ADJUSTMENT', page: '0' })
    })

    it('filtro por item usa as opções de /items e envia itemId', async () => {
        const queries = []
        server.use(
            ...baseHandlers(),
            http.get(`${API}/movements`, ({ request }) => {
                queries.push(Object.fromEntries(new URL(request.url).searchParams))
                return HttpResponse.json(pageOfMovements([movement(1)]))
            }),
        )
        renderPage(<MovementsPage />)
        await screen.findByText(/Entrada #1/)
        await userEvent.click(screen.getByRole('combobox', { name: /^item/i }))
        await userEvent.click(await screen.findByRole('option', { name: 'Arroz' }))
        await waitFor(() => expect(queries.some((query) => query.itemId === '1')).toBe(true))
    })

    it('filtro por usuário usa as opções de /users/options', async () => {
        const queries = []
        server.use(
            ...baseHandlers(),
            http.get(`${API}/movements`, ({ request }) => {
                queries.push(Object.fromEntries(new URL(request.url).searchParams))
                return HttpResponse.json(pageOfMovements([movement(1)]))
            }),
        )
        renderPage(<MovementsPage />, { role: 'OPERATOR' })
        await screen.findByText(/Entrada #1/)
        await userEvent.click(screen.getByRole('combobox', { name: /usuário/i }))
        await userEvent.click(await screen.findByRole('option', { name: 'Coordenador Demo' }))
        await waitFor(() => expect(queries.some((query) => query.userId === '1')).toBe(true))
    })

    it('erro do servidor é exibido', async () => {
        server.use(
            ...baseHandlers(),
            http.get(`${API}/movements`, () =>
                HttpResponse.json(
                    { status: 500, message: 'Falha ao listar movimentações' },
                    { status: 500 },
                ),
            ),
        )
        renderPage(<MovementsPage />)
        expect(await screen.findByText('Falha ao listar movimentações')).toBeInTheDocument()
    })

    describe('detalhe e estorno', () => {
        const openDetail = async (overrides, role = 'COORDINATOR') => {
            server.use(
                ...baseHandlers(),
                http.get(`${API}/movements`, () =>
                    HttpResponse.json(pageOfMovements([movement(7, overrides)])),
                ),
                http.get(`${API}/movements/7`, () =>
                    HttpResponse.json({
                        ...movement(7, overrides),
                        original: null,
                        reversal: null,
                    }),
                ),
            )
            renderPage(<MovementsPage />, { role, route: '/?movementId=7' })
        }

        it('abre o detalhe via GET /movements/{id}', async () => {
            await openDetail({
                type: 'ADJUSTMENT',
                adjustmentReason: 'LOSS',
                reference: { label: 'Ajuste — Perda' },
            })
            const dialog = await screen.findByRole('dialog')
            expect(await within(dialog).findByText(/#7/)).toBeInTheDocument()
        })

        it('estorno exige justificativa e envia POST /movements/{id}/reverse', async () => {
            let body
            server.use(
                http.post(`${API}/movements/7/reverse`, async ({ request }) => {
                    body = await request.json()
                    return HttpResponse.json(movement(8, { type: 'REVERSAL', reversesId: 7 }), {
                        status: 201,
                    })
                }),
            )
            await openDetail({
                type: 'ADJUSTMENT',
                adjustmentReason: 'LOSS',
                reference: { label: 'Ajuste — Perda' },
            })
            const dialog = await screen.findByRole('dialog')
            await userEvent.click(await within(dialog).findByRole('button', { name: /estornar/i }))
            const reverse = await screen.findByRole('dialog', { name: /estornar lançamento #7/i })

            await userEvent.click(within(reverse).getByRole('button', { name: /estornar/i }))
            expect(body).toBeUndefined()
            await userEvent.type(
                within(reverse).getByLabelText('Justificativa'),
                'Lançado por engano',
            )
            await userEvent.click(within(reverse).getByRole('button', { name: /estornar/i }))
            await waitFor(() => expect(body).toMatchObject({ justification: 'Lançado por engano' }))
        })

        it('operador não vê o botão de estorno', async () => {
            await openDetail(
                {
                    type: 'ADJUSTMENT',
                    adjustmentReason: 'LOSS',
                    reference: { label: 'Ajuste — Perda' },
                },
                'OPERATOR',
            )
            const dialog = await screen.findByRole('dialog')
            await within(dialog).findByText(/#7/)
            expect(
                within(dialog).queryByRole('button', { name: /estornar/i }),
            ).not.toBeInTheDocument()
        })

        it('lançamento já estornado não oferece novo estorno', async () => {
            await openDetail({
                type: 'ADJUSTMENT',
                reversedById: 9,
                reference: { label: 'Ajuste — Perda' },
            })
            const dialog = await screen.findByRole('dialog')
            await within(dialog).findByText(/#7/)
            expect(
                within(dialog).queryByRole('button', { name: /estornar/i }),
            ).not.toBeInTheDocument()
        })
    })
})
