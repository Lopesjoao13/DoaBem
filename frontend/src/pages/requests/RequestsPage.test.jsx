import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/server.js'
import { API, renderPage } from '@/test/utils.jsx'
import RequestsPage from './RequestsPage.jsx'

const row = (id, overrides = {}) => ({
    id,
    status: 'PENDING',
    createdAt: '2026-11-10T10:00:00',
    beneficiaryId: 1,
    beneficiaryName: `Família ${id}`,
    requestedBy: 'Operador Demo',
    itemCount: 1,
    ...overrides,
})

const COUNTS = {
    PENDING: 2,
    APPROVED: 1,
    REJECTED: 0,
    PICKED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
    ALL: 3,
}

const listPage = (rows, counts = COUNTS) => ({
    content: rows,
    page: { size: 1000, number: 0, totalElements: rows.length, totalPages: 1 },
    counts,
})

const detail = (status, overrides = {}) => ({
    ...row(11, { status }),
    beneficiary: {
        id: 1,
        responsibleName: 'Maria Souza',
        householdSize: 4,
        neighborhood: 'Centro',
        phone: null,
        status: 'ACTIVE',
    },
    items: [
        {
            id: 101,
            itemId: 1,
            itemName: 'Arroz',
            unitOfMeasure: 'KG',
            itemStatus: 'ACTIVE',
            requestedQty: 10,
            approvedQty: status === 'PENDING' ? null : 10,
            available: 100,
        },
    ],
    decidedBy: null,
    decidedAt: null,
    justification: null,
    pickedBy: null,
    pickedAt: null,
    cancelledBy: null,
    cancelledAt: null,
    cancellationReason: null,
    delivery: null,
    familyHistory: { lastDelivery: null, recentDeliveries: [] },
    ...overrides,
})

const withDetail = (status, overrides) =>
    http.get(`${API}/requests/11`, () => HttpResponse.json(detail(status, overrides)))

const openRequest = async (status, role = 'COORDINATOR', overrides) => {
    server.use(
        http.get(`${API}/requests`, () => HttpResponse.json(listPage([row(11, { status })]))),
        withDetail(status, overrides),
    )
    renderPage(<RequestsPage />, { role, route: '/?solicitacao=11' })
    return screen.findByRole('dialog')
}

describe('RequestsPage - lista', () => {
    it('lista as solicitações e mostra a contagem por estado nas abas (counts do backend)', async () => {
        server.use(
            http.get(`${API}/requests`, () =>
                HttpResponse.json(listPage([row(1), row(2), row(3, { status: 'APPROVED' })])),
            ),
        )
        renderPage(<RequestsPage />)
        expect(await screen.findByText(/Família 1/)).toBeInTheDocument()
        await userEvent.click(screen.getByRole('combobox', { name: /estado/i }))
        expect(await screen.findByRole('option', { name: 'Todas (3)' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Pendentes (2)' })).toBeInTheDocument()
    })

    it('trocar de aba pede a lista filtrada por status', async () => {
        const seen = []
        server.use(
            http.get(`${API}/requests`, ({ request }) => {
                const status = new URL(request.url).searchParams.get('status')
                seen.push(status)
                return HttpResponse.json(
                    listPage(
                        status === 'APPROVED'
                            ? [row(3, { status: 'APPROVED' })]
                            : [row(1), row(3, { status: 'APPROVED' })],
                    ),
                )
            }),
        )
        renderPage(<RequestsPage />)
        await screen.findByText(/Família 1/)
        await userEvent.click(screen.getByRole('combobox', { name: /estado/i }))
        await userEvent.click(await screen.findByRole('option', { name: /Aprovadas/ }))
        await waitFor(() => expect(seen).toContain('APPROVED'))
        await waitFor(() => expect(screen.queryByText(/Família 1/)).not.toBeInTheDocument())
    })

    it('busca por nome da família ou número', async () => {
        server.use(
            http.get(`${API}/requests`, () =>
                HttpResponse.json(listPage([row(1), row(2, { beneficiaryName: 'Joana Lima' })])),
            ),
        )
        renderPage(<RequestsPage />)
        await screen.findByText(/Família 1/)
        await userEvent.type(screen.getByPlaceholderText('Família ou nº da solicitação'), 'joana')
        await waitFor(() => expect(screen.queryByText(/Família 1/)).not.toBeInTheDocument())
        expect(screen.getByText(/Joana Lima/)).toBeInTheDocument()
    })

    it('erro do servidor aparece com "Tentar novamente"', async () => {
        server.use(
            http.get(`${API}/requests`, () =>
                HttpResponse.json({ status: 500, message: 'Falha ao listar' }, { status: 500 }),
            ),
        )
        renderPage(<RequestsPage />)
        expect(await screen.findByText('Falha ao listar')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument()
    })
})

describe('RequestsPage - ações por estado e perfil', () => {
    it('PENDING: coordenador vê "Analisar" e "Cancelar"; operador não vê "Analisar"', async () => {
        const dialog = await openRequest('PENDING', 'COORDINATOR')
        expect(await within(dialog).findByRole('button', { name: 'Analisar' })).toBeInTheDocument()
        expect(
            within(dialog).getByRole('button', { name: /cancelar solicitação/i }),
        ).toBeInTheDocument()
    })

    it('PENDING: operador não pode analisar', async () => {
        const dialog = await openRequest('PENDING', 'OPERATOR')
        await within(dialog).findByText(/Maria Souza/)
        expect(within(dialog).queryByRole('button', { name: 'Analisar' })).not.toBeInTheDocument()
    })

    it('APPROVED: aparece "Separar itens"', async () => {
        const dialog = await openRequest('APPROVED')
        expect(
            await within(dialog).findByRole('button', { name: /separar itens/i }),
        ).toBeInTheDocument()
    })

    it('PICKED: aparece "Confirmar entrega"', async () => {
        const dialog = await openRequest('PICKED')
        expect(
            await within(dialog).findByRole('button', { name: /confirmar entrega/i }),
        ).toBeInTheDocument()
    })

    it('DELIVERED: nenhuma ação disponível', async () => {
        const dialog = await openRequest('DELIVERED', 'COORDINATOR', {
            delivery: {
                id: 1,
                deliveredAt: '2026-11-11T10:00:00',
                deliveredBy: 'Operador Demo',
                notes: null,
            },
        })
        await within(dialog).findByText(/Maria Souza/)
        for (const name of [
            /analisar/i,
            /separar itens/i,
            /confirmar entrega/i,
            /cancelar solicitação/i,
        ]) {
            expect(within(dialog).queryByRole('button', { name })).not.toBeInTheDocument()
        }
    })

    it('solicitação inexistente (404) mostra a mensagem', async () => {
        server.use(
            http.get(`${API}/requests`, () => HttpResponse.json(listPage([]))),
            http.get(`${API}/requests/11`, () =>
                HttpResponse.json(
                    { status: 404, message: 'Solicitação não encontrada.' },
                    { status: 404 },
                ),
            ),
        )
        renderPage(<RequestsPage />, { route: '/?solicitacao=11' })
        expect(await screen.findByText('Solicitação não encontrada.')).toBeInTheDocument()
    })
})

describe('RequestsPage - decisão', () => {
    const openDecision = async () => {
        const dialog = await openRequest('PENDING')
        await userEvent.click(await within(dialog).findByRole('button', { name: 'Analisar' }))
        return screen.findByRole('dialog', { name: /analisar solicitação #11/i })
    }

    it('aprovar envia números (vírgula decimal convertida) para POST /requests/11/decision', async () => {
        let body
        server.use(
            http.post(`${API}/requests/11/decision`, async ({ request }) => {
                body = await request.json()
                return HttpResponse.json({ id: 11, status: 'APPROVED' })
            }),
        )
        const decision = await openDecision()
        const approved = within(decision).getByLabelText(/Aprovado/)
        await userEvent.clear(approved)
        await userEvent.type(approved, '10')
        await userEvent.click(within(decision).getByRole('button', { name: 'Aprovar' }))

        await waitFor(() => expect(body).toBeDefined())
        expect(body).toMatchObject({ decision: 'APPROVE', items: [{ id: 101, approvedQty: 10 }] })
        expect(typeof body.items[0].approvedQty).toBe('number')
    })

    it('aprovado acima do solicitado é barrado no cliente', async () => {
        let called = false
        server.use(
            http.post(
                `${API}/requests/11/decision`,
                () => ((called = true), HttpResponse.json({ id: 11, status: 'APPROVED' })),
            ),
        )
        const decision = await openDecision()
        const approved = within(decision).getByLabelText(/Aprovado/)
        await userEvent.clear(approved)
        await userEvent.type(approved, '11')
        await userEvent.click(within(decision).getByRole('button', { name: 'Aprovar' }))
        expect(
            await within(decision).findByText(/não pode (ser )?(maior|exceder|superar)|acima/i),
        ).toBeInTheDocument()
        expect(called).toBe(false)
    })

    it('recusar sem justificativa não chama a API; com justificativa envia REJECT', async () => {
        let body
        server.use(
            http.post(`${API}/requests/11/decision`, async ({ request }) => {
                body = await request.json()
                return HttpResponse.json({ id: 11, status: 'REJECTED' })
            }),
        )
        const decision = await openDecision()
        await userEvent.click(within(decision).getByRole('button', { name: 'Recusar' }))
        expect(body).toBeUndefined()
        await userEvent.type(within(decision).getByLabelText('Justificativa'), 'Fora do perfil')
        await userEvent.click(within(decision).getByRole('button', { name: 'Recusar' }))
        await waitFor(() => expect(body).toBeDefined())
        expect(body).toMatchObject({ decision: 'REJECT', justification: 'Fora do perfil' })
    })

    it('fieldErrors aninhados do backend (approved.<id>) aparecem no campo da linha', async () => {
        server.use(
            http.post(`${API}/requests/11/decision`, () =>
                HttpResponse.json(
                    {
                        status: 400,
                        message: 'Revise os campos destacados.',
                        fieldErrors: { 'approved.101': 'Itens em KG aceitam até 3 casas.' },
                    },
                    { status: 400 },
                ),
            ),
        )
        const decision = await openDecision()
        const approved = within(decision).getByLabelText(/Aprovado/)
        await userEvent.clear(approved)
        await userEvent.type(approved, '5')
        await userEvent.type(within(decision).getByLabelText('Justificativa'), 'parcial')
        await userEvent.click(within(decision).getByRole('button', { name: 'Aprovar' }))
        expect(
            await within(decision).findByText('Itens em KG aceitam até 3 casas.'),
        ).toBeInTheDocument()
        expect(within(decision).getByText('Revise os campos destacados.')).toBeInTheDocument()
    })
})

describe('RequestsPage - separar, entregar e cancelar', () => {
    it('separar: confirma e chama POST /requests/11/pick', async () => {
        let picked = false
        server.use(
            http.post(
                `${API}/requests/11/pick`,
                () => ((picked = true), HttpResponse.json({ id: 11, status: 'PICKED' })),
            ),
        )
        const dialog = await openRequest('APPROVED')
        await userEvent.click(await within(dialog).findByRole('button', { name: /separar itens/i }))
        const confirm = await screen.findByRole('dialog', { name: /separar solicitação #11/i })
        await userEvent.click(within(confirm).getByRole('button', { name: /^separar/i }))
        await waitFor(() => expect(picked).toBe(true))
    })

    it('separar com estoque insuficiente: mostra a mensagem do backend (409)', async () => {
        server.use(
            http.post(`${API}/requests/11/pick`, () =>
                HttpResponse.json(
                    { status: 409, message: 'Saldo insuficiente de Arroz.' },
                    { status: 409 },
                ),
            ),
        )
        const dialog = await openRequest('APPROVED')
        await userEvent.click(await within(dialog).findByRole('button', { name: /separar itens/i }))
        const confirm = await screen.findByRole('dialog', { name: /separar solicitação #11/i })
        await userEvent.click(within(confirm).getByRole('button', { name: /^separar/i }))
        expect(await screen.findByText('Saldo insuficiente de Arroz.')).toBeInTheDocument()
    })

    it('entregar: envia a observação em POST /requests/11/deliver', async () => {
        let body
        server.use(
            http.post(`${API}/requests/11/deliver`, async ({ request }) => {
                body = await request.json()
                return HttpResponse.json({ id: 11, status: 'DELIVERED' })
            }),
        )
        const dialog = await openRequest('PICKED')
        await userEvent.click(
            await within(dialog).findByRole('button', { name: /confirmar entrega/i }),
        )
        const confirm = await screen.findByRole('dialog', { name: /confirmar entrega #11/i })
        await userEvent.type(within(confirm).getByLabelText(/Observação/), 'Retirou o responsável')
        await userEvent.click(within(confirm).getByRole('button', { name: 'Confirmar entrega' }))
        await waitFor(() => expect(body).toEqual({ notes: 'Retirou o responsável' }))
    })

    it('cancelar exige motivo e envia POST /requests/11/cancel', async () => {
        let body
        server.use(
            http.post(`${API}/requests/11/cancel`, async ({ request }) => {
                body = await request.json()
                return HttpResponse.json({ id: 11, status: 'CANCELLED' })
            }),
        )
        const dialog = await openRequest('PENDING')
        await userEvent.click(
            await within(dialog).findByRole('button', { name: /cancelar solicitação/i }),
        )
        const confirm = await screen.findByRole('dialog', { name: /cancelar solicitação #11/i })
        await userEvent.click(within(confirm).getByRole('button', { name: 'Cancelar solicitação' }))
        expect(body).toBeUndefined()
        await userEvent.type(within(confirm).getByLabelText('Motivo'), 'Família desistiu')
        await userEvent.click(within(confirm).getByRole('button', { name: 'Cancelar solicitação' }))
        await waitFor(() => expect(body).toEqual({ reason: 'Família desistiu' }))
    })

    it('após uma ação o detalhe e a lista são recarregados (cache invalidado)', async () => {
        let detailLoads = 0
        let listLoads = 0
        server.use(
            http.get(`${API}/requests`, () => {
                listLoads += 1
                return HttpResponse.json(listPage([row(11, { status: 'PENDING' })]))
            }),
            http.get(`${API}/requests/11`, () => {
                detailLoads += 1
                return HttpResponse.json(detail('PENDING'))
            }),
            http.post(`${API}/requests/11/cancel`, () =>
                HttpResponse.json({ id: 11, status: 'CANCELLED' }),
            ),
        )
        renderPage(<RequestsPage />, { route: '/?solicitacao=11' })
        const dialog = await screen.findByRole('dialog')
        await userEvent.click(
            await within(dialog).findByRole('button', { name: /cancelar solicitação/i }),
        )
        const confirm = await screen.findByRole('dialog', { name: /cancelar solicitação #11/i })
        await userEvent.type(within(confirm).getByLabelText('Motivo'), 'x')
        await userEvent.click(within(confirm).getByRole('button', { name: 'Cancelar solicitação' }))
        await waitFor(() => expect(detailLoads + listLoads).toBeGreaterThan(2))
    })
})
