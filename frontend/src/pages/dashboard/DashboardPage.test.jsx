import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/server.js'
import { API, renderPage } from '@/test/utils.jsx'
import DashboardPage from './DashboardPage.jsx'

const summary = (overrides = {}) => ({
    activeItems: 12,
    activeCategories: 4,
    criticalItems: 2,
    entriesInPeriod: 7,
    deliveriesInPeriod: 5,
    pendingRequests: 3,
    topCritical: [
        {
            itemId: 1,
            name: 'Arroz Crítico',
            categoryName: 'Grãos',
            unitOfMeasure: 'KG',
            minStock: 10,
            available: 1,
            level: 'CRITICAL',
        },
    ],
    recentMovements: [
        {
            id: 1,
            type: 'ENTRY',
            occurredAt: '2026-11-10T10:00:00',
            itemName: 'Feijão',
            unitOfMeasure: 'KG',
            quantity: 5,
            userName: 'Coordenador Demo',
        },
    ],
    monthly: [
        { month: '2026-10', entries: 3, deliveries: 1 },
        { month: '2026-11', entries: 4, deliveries: 4 },
    ],
    balanceByCategory: [{ categoryId: 1, categoryName: 'Grãos', available: 40 }],
    pendingList: [
        {
            id: 9,
            createdAt: '2026-11-10T10:00:00',
            beneficiaryName: 'Família Pendente',
            itemCount: 2,
        },
    ],
    previous: { entries: 2, deliveries: 3 },
    generatedAt: '2026-11-15T12:00:00',
    ...overrides,
})

describe('DashboardPage', () => {
    it('envia o período (from/to) e exibe os indicadores da API', async () => {
        let params
        server.use(
            http.get(`${API}/dashboard`, ({ request }) => {
                params = new URL(request.url).searchParams
                return HttpResponse.json(summary())
            }),
        )
        renderPage(<DashboardPage />)
        expect(await screen.findByText('Arroz Crítico')).toBeInTheDocument()
        expect(params.get('from')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(params.get('to')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(params.get('from') <= params.get('to')).toBe(true)
    })

    it('mostra os totais dos cartões', async () => {
        server.use(
            http.get(`${API}/dashboard`, () =>
                HttpResponse.json(summary({ activeItems: 12, pendingRequests: 3 })),
            ),
        )
        renderPage(<DashboardPage />)
        await screen.findByText('Arroz Crítico')
        expect(screen.getAllByText('12').length).toBeGreaterThan(0)
    })

    it('listas vazias não quebram a tela', async () => {
        server.use(
            http.get(`${API}/dashboard`, () =>
                HttpResponse.json(
                    summary({
                        topCritical: [],
                        recentMovements: [],
                        monthly: [],
                        balanceByCategory: [],
                        pendingList: [],
                    }),
                ),
            ),
        )
        renderPage(<DashboardPage />)
        expect(await screen.findByText('Dashboard')).toBeInTheDocument()
        await screen.findByText(/nenhum|sem /i, undefined, { timeout: 3000 }).catch(() => {})
        expect(screen.queryByText(/Não foi possível/)).not.toBeInTheDocument()
    })

    it('erro mostra a mensagem e "Tentar novamente" recarrega', async () => {
        let calls = 0
        server.use(
            http.get(`${API}/dashboard`, () => {
                calls += 1
                return calls === 1
                    ? HttpResponse.json(
                          { status: 500, message: 'Dashboard indisponível' },
                          { status: 500 },
                      )
                    : HttpResponse.json(summary())
            }),
        )
        renderPage(<DashboardPage />)
        expect(await screen.findByText('Dashboard indisponível')).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))
        expect(await screen.findByText('Arroz Crítico')).toBeInTheDocument()
    })
})
