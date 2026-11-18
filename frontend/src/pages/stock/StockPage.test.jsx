import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/server.js'
import { API, renderPage } from '@/test/utils.jsx'
import StockPage from './StockPage.jsx'

const row = (itemId, overrides = {}) => ({
    itemId,
    name: `Item ${itemId}`,
    categoryId: 1,
    categoryName: 'Alimentos',
    unitOfMeasure: 'KG',
    minStock: 10,
    status: 'ACTIVE',
    physical: 100,
    reserved: 10,
    available: 90,
    level: 'NORMAL',
    ...overrides,
})

const stockHandler = (rows, onRequest) =>
    http.get(`${API}/stock`, ({ request }) => {
        onRequest?.(new URL(request.url).searchParams)
        return HttpResponse.json(rows)
    })

describe('StockPage', () => {
    it('lista o estoque devolvido pela API (lista simples, sem paginação)', async () => {
        server.use(
            stockHandler([
                row(1, { name: 'Arroz' }),
                row(2, { name: 'Feijão', categoryName: 'Grãos' }),
            ]),
        )
        renderPage(<StockPage />)
        expect(await screen.findByText('Arroz')).toBeInTheDocument()
        expect(screen.getByText('Feijão')).toBeInTheDocument()
    })

    it('envia o filtro de situação como status na query', async () => {
        let params
        server.use(stockHandler([], (search) => (params = search)))
        renderPage(<StockPage />)
        await screen.findByText(/nenhum/i)
        expect(params.has('status')).toBe(true)
    })

    it('mostra erro com opção de tentar de novo', async () => {
        let calls = 0
        server.use(
            http.get(`${API}/stock`, () => {
                calls += 1
                return calls === 1
                    ? HttpResponse.json(
                          { status: 500, message: 'Estoque indisponível' },
                          { status: 500 },
                      )
                    : HttpResponse.json([row(9, { name: 'Recuperado' })])
            }),
        )
        renderPage(<StockPage />)
        expect(await screen.findByText('Estoque indisponível')).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))
        expect(await screen.findByText('Recuperado')).toBeInTheDocument()
    })

    it('busca filtra linhas no cliente', async () => {
        server.use(stockHandler([row(1, { name: 'Arroz' }), row(2, { name: 'Feijão' })]))
        renderPage(<StockPage />)
        await screen.findByText('Arroz')
        await userEvent.type(screen.getByRole('searchbox'), 'feij')
        await waitFor(() => expect(screen.queryByText('Arroz')).not.toBeInTheDocument())
        expect(screen.getByText('Feijão')).toBeInTheDocument()
    })

    it('coordenador vê o botão de ajuste; operador não', async () => {
        server.use(stockHandler([row(1)]))
        const first = renderPage(<StockPage />, { role: 'COORDINATOR' })
        await screen.findByText('Item 1')
        expect(screen.getByRole('button', { name: /ajuste/i })).toBeInTheDocument()
        first.unmount()

        server.use(stockHandler([row(1)]))
        renderPage(<StockPage />, { role: 'OPERATOR' })
        await screen.findByText('Item 1')
        expect(screen.queryByRole('button', { name: /ajuste/i })).not.toBeInTheDocument()
    })

    it('ajuste de estoque envia o corpo correto e recarrega o estoque', async () => {
        let posted
        let loads = 0
        server.use(
            http.get(`${API}/stock`, () => {
                loads += 1
                return HttpResponse.json([row(1, { name: 'Arroz', available: 90 })])
            }),
            http.post(`${API}/stock/adjustments`, async ({ request }) => {
                posted = await request.json()
                return HttpResponse.json({ id: 99, type: 'ADJUSTMENT' }, { status: 201 })
            }),
        )
        renderPage(<StockPage />)
        await screen.findByText('Arroz')
        await userEvent.click(screen.getByRole('button', { name: /ajuste/i }))
        const dialog = await screen.findByRole('dialog')

        await userEvent.click(within(dialog).getByRole('combobox', { name: /item/i }))
        await userEvent.click(await screen.findByRole('option', { name: /Arroz/ }))
        await userEvent.click(within(dialog).getByRole('combobox', { name: /motivo/i }))
        await userEvent.click(await screen.findByRole('option', { name: /perda/i }))
        await userEvent.type(within(dialog).getByLabelText(/quantidade/i), '2,5')
        await userEvent.type(within(dialog).getByLabelText(/observa/i), 'Caiu no chão')
        await userEvent.click(
            within(dialog).getByRole('button', { name: /registrar|salvar|confirmar/i }),
        )

        await waitFor(() => expect(posted).toBeDefined())
        // O backend só aceita números: id e quantidade digitada (com vírgula) viram number.
        expect(posted).toEqual({
            itemId: 1,
            quantity: 2.5,
            adjustmentReason: 'LOSS',
            notes: 'Caiu no chão',
        })
        await waitFor(() => expect(loads).toBeGreaterThanOrEqual(2))
    })

    it('ajuste acima do disponível é barrado no formulário (não chama a API)', async () => {
        let posted = false
        server.use(
            stockHandler([row(1, { name: 'Arroz', available: 5 })]),
            http.post(
                `${API}/stock/adjustments`,
                () => ((posted = true), HttpResponse.json({}, { status: 201 })),
            ),
        )
        renderPage(<StockPage />)
        await screen.findByText('Arroz')
        await userEvent.click(screen.getByRole('button', { name: /ajuste/i }))
        const dialog = await screen.findByRole('dialog')
        await userEvent.click(within(dialog).getByRole('combobox', { name: /item/i }))
        await userEvent.click(await screen.findByRole('option', { name: /Arroz/ }))
        await userEvent.click(within(dialog).getByRole('combobox', { name: /motivo/i }))
        await userEvent.click(await screen.findByRole('option', { name: /perda/i }))
        await userEvent.type(within(dialog).getByLabelText(/quantidade/i), '50')
        await userEvent.type(within(dialog).getByLabelText(/observa/i), 'x')
        await userEvent.click(
            within(dialog).getByRole('button', { name: /registrar|salvar|confirmar/i }),
        )

        expect(await within(dialog).findByText(/dispon/i, { selector: 'span' })).toBeInTheDocument()
        expect(posted).toBe(false)
    })
})
