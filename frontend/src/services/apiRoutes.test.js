import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/server.js'
import { API, signInAs } from '@/test/utils.jsx'
import * as auth from './authService.js'
import * as beneficiaries from './beneficiaryService.js'
import * as catalog from './catalogService.js'
import * as dashboard from './dashboardService.js'
import * as entries from './entryService.js'
import * as movements from './movementService.js'
import * as requests from './requestService.js'
import * as stock from './stockService.js'
import * as users from './userService.js'

const LIST_ALL = { page: '0', size: '1000' }

// [função, argumentos, método, caminho, query esperada, corpo esperado]
const ROUTES = [
    ['auth.getCurrentUser', () => auth.getCurrentUser(), 'GET', '/auth/me', {}, undefined],

    ['users.listUsers', () => users.listUsers(), 'GET', '/users', LIST_ALL, undefined],
    [
        'users.listUserOptions',
        () => users.listUserOptions(),
        'GET',
        '/users/options',
        {},
        undefined,
    ],
    ['users.getUser', () => users.getUser(7), 'GET', '/users/7', {}, undefined],
    [
        'users.createUser',
        () =>
            users.createUser({ name: 'A', email: 'a@b.c', password: '12345678', role: 'OPERATOR' }),
        'POST',
        '/users',
        {},
        { name: 'A', email: 'a@b.c', password: '12345678', role: 'OPERATOR' },
    ],
    [
        'users.updateUser',
        () => users.updateUser(7, { name: 'B', email: 'b@b.c', role: 'COORDINATOR' }),
        'PUT',
        '/users/7',
        {},
        { name: 'B', email: 'b@b.c', role: 'COORDINATOR' },
    ],
    [
        'users.setUserActive',
        () => users.setUserActive(7, false),
        'PATCH',
        '/users/7/status',
        {},
        { active: false },
    ],

    [
        'catalog.listCategories',
        () => catalog.listCategories(),
        'GET',
        '/categories',
        LIST_ALL,
        undefined,
    ],
    [
        'catalog.listCategories (active)',
        () => catalog.listCategories({ active: true }),
        'GET',
        '/categories',
        { ...LIST_ALL, active: 'true' },
        undefined,
    ],
    ['catalog.getCategory', () => catalog.getCategory(3), 'GET', '/categories/3', {}, undefined],
    [
        'catalog.createCategory',
        () => catalog.createCategory({ name: 'Higiene', description: 'x' }),
        'POST',
        '/categories',
        {},
        { name: 'Higiene', description: 'x' },
    ],
    [
        'catalog.updateCategory',
        () => catalog.updateCategory(3, { name: 'Limpeza' }),
        'PUT',
        '/categories/3',
        {},
        { name: 'Limpeza' },
    ],
    [
        'catalog.setCategoryActive',
        () => catalog.setCategoryActive(3, true),
        'PATCH',
        '/categories/3/status',
        {},
        { active: true },
    ],
    ['catalog.listItems', () => catalog.listItems(), 'GET', '/items', LIST_ALL, undefined],
    [
        'catalog.listItems (filtros)',
        () => catalog.listItems({ status: 'ACTIVE', categoryId: 2, search: 'arroz' }),
        'GET',
        '/items',
        { ...LIST_ALL, status: 'ACTIVE', categoryId: '2', search: 'arroz' },
        undefined,
    ],
    ['catalog.getItem', () => catalog.getItem(5), 'GET', '/items/5', {}, undefined],
    [
        'catalog.createItem',
        () =>
            catalog.createItem({ categoryId: 1, name: 'Arroz', unitOfMeasure: 'KG', minStock: 5 }),
        'POST',
        '/items',
        {},
        { categoryId: 1, name: 'Arroz', unitOfMeasure: 'KG', minStock: 5 },
    ],
    [
        'catalog.updateItem',
        () => catalog.updateItem(5, { categoryId: 1, name: 'Feijão', minStock: 2 }),
        'PUT',
        '/items/5',
        {},
        { categoryId: 1, name: 'Feijão', minStock: 2 },
    ],
    [
        'catalog.setItemStatus',
        () => catalog.setItemStatus(5, 'INACTIVE'),
        'PATCH',
        '/items/5/status',
        {},
        { status: 'INACTIVE' },
    ],

    [
        'beneficiaries.listBeneficiaries',
        () => beneficiaries.listBeneficiaries(),
        'GET',
        '/beneficiaries',
        LIST_ALL,
        undefined,
    ],
    [
        'beneficiaries.listBeneficiaries (filtros)',
        () => beneficiaries.listBeneficiaries({ status: 'ACTIVE', search: 'maria' }),
        'GET',
        '/beneficiaries',
        { ...LIST_ALL, status: 'ACTIVE', search: 'maria' },
        undefined,
    ],
    [
        'beneficiaries.getBeneficiary',
        () => beneficiaries.getBeneficiary(9),
        'GET',
        '/beneficiaries/9',
        {},
        undefined,
    ],
    [
        'beneficiaries.createBeneficiary',
        () => beneficiaries.createBeneficiary({ responsibleName: 'Maria', householdSize: 4 }),
        'POST',
        '/beneficiaries',
        {},
        { responsibleName: 'Maria', householdSize: 4 },
    ],
    [
        'beneficiaries.updateBeneficiary',
        () => beneficiaries.updateBeneficiary(9, { responsibleName: 'Ana', householdSize: 2 }),
        'PUT',
        '/beneficiaries/9',
        {},
        { responsibleName: 'Ana', householdSize: 2 },
    ],
    [
        'beneficiaries.setBeneficiaryStatus',
        () => beneficiaries.setBeneficiaryStatus(9, 'INACTIVE'),
        'PATCH',
        '/beneficiaries/9/status',
        {},
        { status: 'INACTIVE' },
    ],
    [
        'requests.getDeliverySummary',
        () => requests.getDeliverySummary(9),
        'GET',
        '/beneficiaries/9/delivery-summary',
        {},
        undefined,
    ],
    [
        'requests.getFamilyHistory',
        () => requests.getFamilyHistory(9),
        'GET',
        '/beneficiaries/9/requests',
        {},
        undefined,
    ],

    [
        'entries.listEntries',
        () => entries.listEntries(),
        'GET',
        '/donation-entries',
        LIST_ALL,
        undefined,
    ],
    ['entries.getEntry', () => entries.getEntry(4), 'GET', '/donation-entries/4', {}, undefined],
    [
        'entries.createEntry',
        () => entries.createEntry({ anonymous: false, items: [{ itemId: 1, quantity: 3 }] }),
        'POST',
        '/donation-entries',
        {},
        { anonymous: false, items: [{ itemId: 1, quantity: 3 }] },
    ],

    ['stock.getStock', () => stock.getStock(), 'GET', '/stock', {}, undefined],
    [
        'stock.getStock (status)',
        () => stock.getStock({ status: 'ACTIVE' }),
        'GET',
        '/stock',
        { status: 'ACTIVE' },
        undefined,
    ],
    [
        'stock.createAdjustment',
        () =>
            stock.createAdjustment({
                itemId: 1,
                quantity: 2,
                adjustmentReason: 'LOSS',
                notes: 'caiu',
            }),
        'POST',
        '/stock/adjustments',
        {},
        { itemId: 1, quantity: 2, adjustmentReason: 'LOSS', notes: 'caiu' },
    ],

    [
        'requests.listRequests',
        () => requests.listRequests(),
        'GET',
        '/requests',
        LIST_ALL,
        undefined,
    ],
    [
        'requests.listRequests (status)',
        () => requests.listRequests({ status: 'PENDING' }),
        'GET',
        '/requests',
        { ...LIST_ALL, status: 'PENDING' },
        undefined,
    ],
    ['requests.getRequest', () => requests.getRequest(11), 'GET', '/requests/11', {}, undefined],
    [
        'requests.createRequest',
        () => requests.createRequest({ beneficiaryId: 9, lines: [{ itemId: 1, requestedQty: 2 }] }),
        'POST',
        '/requests',
        {},
        { beneficiaryId: 9, lines: [{ itemId: 1, requestedQty: 2 }] },
    ],
    [
        'requests.decideRequest',
        () =>
            requests.decideRequest(11, {
                decision: 'APPROVE',
                items: [{ id: 1, approvedQty: 2 }],
                justification: 'ok',
            }),
        'POST',
        '/requests/11/decision',
        {},
        { decision: 'APPROVE', items: [{ id: 1, approvedQty: 2 }], justification: 'ok' },
    ],
    [
        'requests.pickRequest',
        () => requests.pickRequest(11),
        'POST',
        '/requests/11/pick',
        {},
        undefined,
    ],
    [
        'requests.deliverRequest',
        () => requests.deliverRequest(11, { notes: 'entregue' }),
        'POST',
        '/requests/11/deliver',
        {},
        { notes: 'entregue' },
    ],
    [
        'requests.cancelRequest',
        () => requests.cancelRequest(11, { reason: 'desistiu' }),
        'POST',
        '/requests/11/cancel',
        {},
        { reason: 'desistiu' },
    ],

    [
        'movements.listMovements',
        () => movements.listMovements(),
        'GET',
        '/movements',
        { size: '10' },
        undefined,
    ],
    [
        'movements.listMovements (filtros)',
        () =>
            movements.listMovements({
                from: '2026-01-01',
                to: '2026-01-31',
                itemId: '3',
                type: 'ENTRY',
                userId: '1',
                page: 2,
            }),
        'GET',
        '/movements',
        {
            size: '10',
            from: '2026-01-01',
            to: '2026-01-31',
            itemId: '3',
            type: 'ENTRY',
            userId: '1',
            page: '2',
        },
        undefined,
    ],
    ['movements.getMovement', () => movements.getMovement(8), 'GET', '/movements/8', {}, undefined],
    [
        'movements.reverseMovement',
        () => movements.reverseMovement(8, { justification: 'erro', itemsReturned: true }),
        'POST',
        '/movements/8/reverse',
        {},
        { justification: 'erro', itemsReturned: true },
    ],

    [
        'dashboard.getDashboard',
        () => dashboard.getDashboard({ from: '2026-01-01', to: '2026-01-31' }),
        'GET',
        '/dashboard',
        { from: '2026-01-01', to: '2026-01-31' },
        undefined,
    ],
]

describe('rotas HTTP dos services (modo real)', () => {
    it.each(ROUTES)('%s', async (_name, call, method, path, query, body) => {
        signInAs()
        let seen
        server.use(
            http.all(`${API}${path}`, async ({ request }) => {
                const text = await request.text()
                seen = {
                    method: request.method,
                    query: Object.fromEntries(new URL(request.url).searchParams),
                    body: text ? JSON.parse(text) : undefined,
                    auth: request.headers.get('authorization'),
                }
                return HttpResponse.json({ ok: true })
            }),
        )

        await call()

        expect(seen, `nenhuma chamada para ${method} ${path}`).toBeDefined()
        expect(seen.method).toBe(method)
        expect(seen.query).toEqual(query)
        expect(seen.body).toEqual(body)
        expect(seen.auth).toBe('Bearer test-token')
    })

    it('login envia e-mail normalizado e devolve a sessão com expiração', async () => {
        let body
        server.use(
            http.post(`${API}/auth/login`, async ({ request }) => {
                body = await request.json()
                return HttpResponse.json({
                    accessToken: 'jwt',
                    tokenType: 'Bearer',
                    expiresIn: 3600,
                    name: 'Coord',
                    role: 'COORDINATOR',
                })
            }),
        )
        const before = Date.now()
        const session = await auth.login('  Coord@DoaBem.Local ', 'segredo')
        expect(body).toEqual({ email: 'coord@doabem.local', password: 'segredo' })
        expect(session.token).toBe('jwt')
        expect(session.user).toEqual({
            name: 'Coord',
            email: 'coord@doabem.local',
            role: 'COORDINATOR',
        })
        expect(session.expiresAt).toBeGreaterThanOrEqual(before + 3_600_000)
    })

    it('todas as rotas do backend estão cobertas pelos services', () => {
        const covered = new Set(
            ROUTES.map(([, , method, path]) => `${method} ${path.replace(/\/\d+/g, '/{id}')}`),
        )
        const expected = [
            'GET /auth/me',
            'GET /users',
            'GET /users/options',
            'GET /users/{id}',
            'POST /users',
            'PUT /users/{id}',
            'PATCH /users/{id}/status',
            'GET /categories',
            'GET /categories/{id}',
            'POST /categories',
            'PUT /categories/{id}',
            'PATCH /categories/{id}/status',
            'GET /items',
            'GET /items/{id}',
            'POST /items',
            'PUT /items/{id}',
            'PATCH /items/{id}/status',
            'GET /beneficiaries',
            'GET /beneficiaries/{id}',
            'POST /beneficiaries',
            'PUT /beneficiaries/{id}',
            'PATCH /beneficiaries/{id}/status',
            'GET /beneficiaries/{id}/delivery-summary',
            'GET /beneficiaries/{id}/requests',
            'GET /donation-entries',
            'GET /donation-entries/{id}',
            'POST /donation-entries',
            'GET /stock',
            'POST /stock/adjustments',
            'GET /requests',
            'GET /requests/{id}',
            'POST /requests',
            'POST /requests/{id}/decision',
            'POST /requests/{id}/pick',
            'POST /requests/{id}/deliver',
            'POST /requests/{id}/cancel',
            'GET /movements',
            'GET /movements/{id}',
            'POST /movements/{id}/reverse',
            'GET /dashboard',
        ]
        expect(expected.filter((route) => !covered.has(route))).toEqual([])
    })
})
