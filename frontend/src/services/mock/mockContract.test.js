import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SHAPES, expectShape, pageOf } from '@/test/shapes.js'
import { saveSession } from '@/services/sessionStorageService.js'

// O mock precisa devolver o mesmo formato do backend (esquemas em src/test/shapes.js),
// senão trocar VITE_USE_MOCK muda o comportamento das telas.
const load = async () => {
    vi.resetModules()
    vi.stubEnv('VITE_USE_MOCK', 'true')
    const modules = {
        users: await import('@/services/userService.js'),
        catalog: await import('@/services/catalogService.js'),
        beneficiaries: await import('@/services/beneficiaryService.js'),
        entries: await import('@/services/entryService.js'),
        stock: await import('@/services/stockService.js'),
        requests: await import('@/services/requestService.js'),
        movements: await import('@/services/movementService.js'),
        dashboard: await import('@/services/dashboardService.js'),
        auth: await import('@/services/authService.js'),
    }
    return modules
}

// As chamadas do mock usam setTimeout para simular latência.
const settle = async (promise) => {
    const result = promise.then(
        (value) => ({ value }),
        (error) => ({ error }),
    )
    await vi.advanceTimersByTimeAsync(2000)
    const outcome = await result
    if (outcome.error) throw outcome.error
    return outcome.value
}

describe('mock segue o contrato do backend', () => {
    let api

    beforeEach(async () => {
        vi.useFakeTimers()
        sessionStorage.clear()
        api = await load()
        saveSession({
            token: 'mock-token-1',
            expiresAt: Date.now() + 3_600_000,
            user: { name: 'Coord', email: 'coordenador@doabem.local', role: 'COORDINATOR' },
        })
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.unstubAllEnvs()
    })

    it('login', async () => {
        sessionStorage.clear()
        const session = await settle(api.auth.login('coordenador@doabem.local', 'Doabem@123'))
        expect(session.user.role).toBe('COORDINATOR')
    })

    it('login com senha errada → 401', async () => {
        await expect(
            settle(api.auth.login('coordenador@doabem.local', 'errada')),
        ).rejects.toMatchObject({ status: 401 })
    })

    it('usuários e opções', async () => {
        expectShape(await settle(api.users.listUsers()), pageOf(SHAPES.user), 'usuários')
        const options = await settle(api.users.listUserOptions())
        options.forEach((option) => expectShape(option, SHAPES.userOption, 'opção'))
    })

    it('categorias e itens', async () => {
        expectShape(
            await settle(api.catalog.listCategories()),
            pageOf(SHAPES.category),
            'categorias',
        )
        expectShape(await settle(api.catalog.listItems()), pageOf(SHAPES.item), 'itens')
    })

    it('famílias', async () => {
        expectShape(
            await settle(api.beneficiaries.listBeneficiaries()),
            pageOf(SHAPES.beneficiary),
            'famílias',
        )
    })

    it('entradas: lista com receivedItems e detalhe', async () => {
        const page = await settle(api.entries.listEntries())
        expectShape(page, pageOf(SHAPES.entrySummary), 'entradas')
        expectShape(await settle(api.entries.getEntry(page.content[0].id)), SHAPES.entry, 'entrada')
    })

    it('estoque', async () => {
        const rows = await settle(api.stock.getStock())
        rows.forEach((row) => expectShape(row, SHAPES.stockRow, 'linha de estoque'))
    })

    it('solicitações: lista com counts, detalhe, resumo e histórico', async () => {
        const list = await settle(api.requests.listRequests())
        expectShape(list, SHAPES.requestList, 'solicitações')
        const detail = await settle(api.requests.getRequest(list.content[0].id))
        expectShape(detail, SHAPES.requestDetail, 'detalhe')
        const beneficiaryId = detail.beneficiaryId
        expectShape(
            await settle(api.requests.getDeliverySummary(beneficiaryId)),
            SHAPES.deliverySummary,
            'resumo',
        )
        expectShape(
            await settle(api.requests.getFamilyHistory(beneficiaryId)),
            SHAPES.familyHistory,
            'histórico',
        )
    })

    it('movimentações: lista e detalhe', async () => {
        const page = await settle(api.movements.listMovements())
        expectShape(page, pageOf(SHAPES.movement), 'movimentações')
        expectShape(
            await settle(api.movements.getMovement(page.content[0].id)),
            SHAPES.movementDetail,
            'movimentação',
        )
    })

    it('dashboard', async () => {
        const period = { from: '2020-01-01', to: '2030-01-01' }
        expectShape(await settle(api.dashboard.getDashboard(period)), SHAPES.dashboard, 'dashboard')
    })

    it('operador não acessa rotas de coordenador (403), como no backend', async () => {
        saveSession({
            token: 'mock-token-2',
            expiresAt: Date.now() + 3_600_000,
            user: { name: 'Op', email: 'operador@doabem.local', role: 'OPERATOR' },
        })
        await expect(settle(api.users.listUsers())).rejects.toMatchObject({ status: 403 })
    })
})
