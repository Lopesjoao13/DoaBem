import { beforeAll, describe, expect, it } from 'vitest'
import { SHAPES, pageOf } from '@/test/shapes.js'
import { httpClient } from '@/services/httpClient.js'
import * as beneficiaries from '@/services/beneficiaryService.js'
import * as catalog from '@/services/catalogService.js'
import * as dashboard from '@/services/dashboardService.js'
import * as entries from '@/services/entryService.js'
import * as movements from '@/services/movementService.js'
import * as requests from '@/services/requestService.js'
import * as stock from '@/services/stockService.js'
import * as users from '@/services/userService.js'
import {
    COORDINATOR,
    OPERATOR,
    check,
    expectFieldError,
    expectOneOfStatus,
    expectStatus,
    isBackendUp,
    signInAs,
    unique,
} from './helpers.js'

const up = await isBackendUp()
const today = () => new Date().toISOString().slice(0, 10)
const stockRow = async (itemId) => (await stock.getStock()).find((row) => row.itemId === itemId)

// Massa de dados isolada por execução.
const world = {}

const prepareWorld = async () => {
    await signInAs(COORDINATOR)
    world.category = await catalog.createCategory({ name: unique('CatOps') })
    world.kg = await catalog.createItem({
        categoryId: world.category.id,
        name: unique('Arroz'),
        unitOfMeasure: 'KG',
        minStock: 10,
    })
    world.unit = await catalog.createItem({
        categoryId: world.category.id,
        name: unique('Sabonete'),
        unitOfMeasure: 'UNIT',
        minStock: 0,
    })
    world.family = await beneficiaries.createBeneficiary({
        responsibleName: unique('Família Ops'),
        householdSize: 3,
    })
    world.entry = await entries.createEntry({
        source: 'Mercado Teste',
        anonymous: false,
        notes: 'carga inicial',
        items: [
            { itemId: world.kg.id, quantity: 100, expiryDate: '2030-01-31' },
            { itemId: world.unit.id, quantity: 50 },
        ],
    })
}

describe.skipIf(!up)('entradas de doação', () => {
    beforeAll(prepareWorld)

    it('criação devolve o detalhe com itens, unidade e quem registrou', () => {
        check(world.entry, SHAPES.entry, 'entrada')
        expect(world.entry.items).toHaveLength(2)
        expect(world.entry.registeredBy).toBeTruthy()
        expect(world.entry.items.find((line) => line.itemId === world.kg.id)).toMatchObject({
            quantity: 100,
            expiryDate: '2030-01-31',
            unitOfMeasure: 'KG',
        })
    })

    it('data da entrada é opcional (padrão hoje)', () => {
        expect(world.entry.entryDate).toBe(today())
    })

    it('doação anônima ignora a origem informada', async () => {
        const anonymous = await entries.createEntry({
            source: 'Fulano',
            anonymous: true,
            items: [{ itemId: world.unit.id, quantity: 1 }],
        })
        expect(anonymous.anonymous).toBe(true)
        expect(anonymous.source ?? null).toBeNull()
    })

    it('a entrada aumenta o físico e o disponível do estoque', async () => {
        const row = await stockRow(world.kg.id)
        expect(row).toMatchObject({ physical: 100, reserved: 0, available: 100 })
    })

    it('detalhe por id e 404', async () => {
        check(await entries.getEntry(world.entry.id), SHAPES.entry, 'entrada')
        await expectStatus(entries.getEntry(999999), 404)
    })

    it('lista paginada traz receivedItems (usado no filtro por item da tela)', async () => {
        const page = await entries.listEntries()
        check(page, pageOf(SHAPES.entrySummary), 'lista de entradas')
        const mine = page.content.find((entry) => entry.id === world.entry.id)
        expect(mine.receivedItems.map((item) => item.itemId).sort()).toEqual(
            [world.kg.id, world.unit.id].sort(),
        )
    })

    it('ordenação padrão: mais recentes primeiro', async () => {
        const { content } = await entries.listEntries()
        const ids = content.map((entry) => entry.id)
        expect(ids).toEqual([...ids].sort((a, b) => b - a))
    })

    it('operador também registra entradas', async () => {
        await signInAs(OPERATOR)
        const created = await entries.createEntry({
            anonymous: true,
            items: [{ itemId: world.unit.id, quantity: 1 }],
        })
        expect(created.registeredBy).toMatch(/operador/i)
        await signInAs(COORDINATOR)
    })

    describe('validação', () => {
        const line = () => ({ itemId: world.kg.id, quantity: 1 })

        it('sem itens → 400', async () => {
            const error = await expectStatus(
                entries.createEntry({ anonymous: false, items: [] }),
                400,
            )
            expect(Object.keys(error.fieldErrors)).toContain('items')
        })

        it('quantidade zero → 400 em items[0].quantity (chave aninhada em items)', async () => {
            const error = await expectStatus(
                entries.createEntry({ anonymous: false, items: [{ ...line(), quantity: 0 }] }),
                400,
            )
            expect(error.fieldErrors.items[0].quantity).toBeTruthy()
        })

        it('quantidade negativa → 400', async () => {
            await expectStatus(
                entries.createEntry({ anonymous: false, items: [{ ...line(), quantity: -2 }] }),
                400,
            )
        })

        it('mais de 3 casas decimais → 400', async () => {
            await expectStatus(
                entries.createEntry({ anonymous: false, items: [{ ...line(), quantity: 1.2345 }] }),
                400,
            )
        })

        it('item sem itemId → 400', async () => {
            await expectStatus(
                entries.createEntry({ anonymous: false, items: [{ quantity: 1 }] }),
                400,
            )
        })

        it('item de unidade inteira com quantidade fracionada → 400/422', async () => {
            await expectOneOfStatus(
                entries.createEntry({
                    anonymous: false,
                    items: [{ itemId: world.unit.id, quantity: 1.5 }],
                }),
                [400, 422],
            )
        })

        it('item inexistente → 404/422', async () => {
            await expectOneOfStatus(
                entries.createEntry({ anonymous: false, items: [{ itemId: 999999, quantity: 1 }] }),
                [404, 422],
            )
        })

        it('item inativo não recebe entrada → 422', async () => {
            const inactive = await catalog.createItem({
                categoryId: world.category.id,
                name: unique('Inativo'),
                unitOfMeasure: 'KG',
            })
            await catalog.setItemStatus(inactive.id, 'INACTIVE')
            await expectOneOfStatus(
                entries.createEntry({
                    anonymous: false,
                    items: [{ itemId: inactive.id, quantity: 1 }],
                }),
                [409, 422],
            )
        })

        it('observação acima de 300 caracteres → 400', async () => {
            await expectStatus(
                entries.createEntry({ anonymous: false, notes: 'n'.repeat(301), items: [line()] }),
                400,
            )
        })

        it('entrada inválida não altera o estoque (atomicidade)', async () => {
            const before = await stockRow(world.kg.id)
            await expectOneOfStatus(
                entries.createEntry({
                    anonymous: false,
                    items: [
                        { itemId: world.kg.id, quantity: 5 },
                        { itemId: 999999, quantity: 1 },
                    ],
                }),
                [400, 404, 422],
            )
            expect(await stockRow(world.kg.id)).toEqual(before)
        })
    })
})

describe.skipIf(!up)('estoque', () => {
    beforeAll(prepareWorld)

    it('lista completa (sem paginação) no formato das telas', async () => {
        const rows = await stock.getStock()
        expect(Array.isArray(rows)).toBe(true)
        rows.forEach((row) => check(row, SHAPES.stockRow, 'linha de estoque'))
    })

    it('calcula o nível: NORMAL acima do mínimo, CRITICAL abaixo', async () => {
        expect((await stockRow(world.kg.id)).level).toBe('NORMAL')
        const low = await catalog.createItem({
            categoryId: world.category.id,
            name: unique('Baixo'),
            unitOfMeasure: 'UNIT',
            minStock: 10,
        })
        await entries.createEntry({ anonymous: true, items: [{ itemId: low.id, quantity: 2 }] })
        expect((await stockRow(low.id)).level).toBe('CRITICAL')
    })

    it('filtro por status', async () => {
        const inactive = await catalog.createItem({
            categoryId: world.category.id,
            name: unique('Off'),
            unitOfMeasure: 'KG',
        })
        await catalog.setItemStatus(inactive.id, 'INACTIVE')
        const active = await stock.getStock({ status: 'ACTIVE' })
        expect(active.every((row) => row.status === 'ACTIVE')).toBe(true)
        expect(active.map((row) => row.itemId)).not.toContain(inactive.id)
        const off = await stock.getStock({ status: 'INACTIVE' })
        expect(off.map((row) => row.itemId)).toContain(inactive.id)
    })

    describe('ajustes (só coordenador)', () => {
        const adjust = (override = {}) =>
            stock.createAdjustment({
                itemId: world.kg.id,
                quantity: 2,
                adjustmentReason: 'LOSS',
                notes: 'caiu no chão',
                ...override,
            })

        it('cria o ajuste, devolve o movimento e baixa o estoque', async () => {
            const before = await stockRow(world.kg.id)
            const movement = await adjust({ quantity: 2.5 })
            check(movement, SHAPES.movement, 'movimento')
            expect(movement).toMatchObject({
                type: 'ADJUSTMENT',
                adjustmentReason: 'LOSS',
                itemId: world.kg.id,
                quantity: 2.5,
            })
            const after = await stockRow(world.kg.id)
            expect(after.physical).toBeCloseTo(before.physical - 2.5, 3)
            expect(after.available).toBeCloseTo(before.available - 2.5, 3)
        })

        it.each(['LOSS', 'DAMAGE', 'EXPIRATION', 'TRANSFER'])(
            'aceita o motivo %s',
            async (reason) => {
                const movement = await adjust({ quantity: 0.1, adjustmentReason: reason })
                expect(movement.adjustmentReason).toBe(reason)
            },
        )

        it('quantidade acima do disponível → 422', async () => {
            const before = await stockRow(world.kg.id)
            await expectOneOfStatus(adjust({ quantity: before.available + 1 }), [409, 422])
            expect(await stockRow(world.kg.id)).toEqual(before)
        })

        it.each([
            ['observação vazia', { notes: '' }, 'notes'],
            ['quantidade zero', { quantity: 0 }, 'quantity'],
            ['quantidade negativa', { quantity: -1 }, 'quantity'],
            ['motivo ausente', { adjustmentReason: null }, 'adjustmentReason'],
            ['item ausente', { itemId: null }, 'itemId'],
        ])('validação: %s → 400 com fieldErrors.%s', async (_name, override, field) => {
            await expectFieldError(adjust(override), field)
        })

        it('motivo inexistente → 400', async () => {
            await expectStatus(adjust({ adjustmentReason: 'ROUBO' }), 400)
        })

        it('item inexistente → 404/422', async () => {
            await expectOneOfStatus(adjust({ itemId: 999999 }), [404, 422])
        })

        it('item de unidade inteira não aceita fração', async () => {
            await expectOneOfStatus(adjust({ itemId: world.unit.id, quantity: 0.5 }), [400, 422])
        })

        it('operador → 403', async () => {
            await signInAs(OPERATOR)
            await expectStatus(adjust(), 403)
            await signInAs(COORDINATOR)
        })
    })
})

describe.skipIf(!up)('solicitações de ajuda', () => {
    let request
    const lines = () => [
        { itemId: world.kg.id, requestedQty: 10 },
        { itemId: world.unit.id, requestedQty: 4 },
    ]
    const create = (override = {}) =>
        requests.createRequest({ beneficiaryId: world.family.id, lines: lines(), ...override })

    beforeAll(prepareWorld)

    describe('criação', () => {
        it('operador cria solicitação PENDING', async () => {
            await signInAs(OPERATOR)
            const created = await create()
            check(created, SHAPES.requestAction, 'solicitação criada')
            expect(created.status).toBe('PENDING')
            request = created
            await signInAs(COORDINATOR)
        })

        it('criar não reserva estoque (RN17)', async () => {
            expect(await stockRow(world.kg.id)).toMatchObject({ reserved: 0, available: 100 })
        })

        it.each([
            ['família ausente', { beneficiaryId: null }, 'beneficiaryId'],
            ['sem linhas', { lines: [] }, 'lines'],
        ])('validação: %s → 400 com fieldErrors.%s', async (_name, override, field) => {
            await expectFieldError(create(override), field)
        })

        it('quantidade zero → 400 em lines[0].requestedQty (aninhado)', async () => {
            const error = await expectStatus(
                create({ lines: [{ itemId: world.kg.id, requestedQty: 0 }] }),
                400,
            )
            expect(error.fieldErrors.lines[0].requestedQty).toBeTruthy()
        })

        it('quantidade fracionada em item de unidade inteira → fieldErrors.lines[n].requestedQty', async () => {
            const error = await expectStatus(
                create({ lines: [{ itemId: world.unit.id, requestedQty: 1.5 }] }),
                400,
            )
            expect(error.fieldErrors.lines[0].requestedQty).toBeTruthy()
        })

        it('item repetido → fieldErrors.lines[1].itemId', async () => {
            const error = await expectStatus(
                create({
                    lines: [
                        { itemId: world.kg.id, requestedQty: 1 },
                        { itemId: world.kg.id, requestedQty: 2 },
                    ],
                }),
                400,
            )
            expect(error.fieldErrors.lines[1].itemId).toBeTruthy()
        })

        it('item inativo → fieldErrors.lines[0].itemId', async () => {
            const off = await catalog.createItem({
                categoryId: world.category.id,
                name: unique('OffReq'),
                unitOfMeasure: 'KG',
            })
            await catalog.setItemStatus(off.id, 'INACTIVE')
            const error = await expectStatus(
                create({ lines: [{ itemId: off.id, requestedQty: 1 }] }),
                400,
            )
            expect(error.fieldErrors.lines[0].itemId).toBeTruthy()
        })

        it('família inativa → fieldErrors.beneficiaryId', async () => {
            const off = await beneficiaries.createBeneficiary({
                responsibleName: unique('Off'),
                householdSize: 1,
            })
            await beneficiaries.setBeneficiaryStatus(off.id, 'INACTIVE')
            const error = await expectStatus(create({ beneficiaryId: off.id }), 400)
            expect(error.fieldErrors.beneficiaryId).toBeTruthy()
        })

        it('família inexistente → 404/400', async () => {
            await expectOneOfStatus(create({ beneficiaryId: 999999 }), [400, 404])
        })

        it('permite pedir mais do que o disponível (a análise é do coordenador)', async () => {
            const big = await create({ lines: [{ itemId: world.kg.id, requestedQty: 5000 }] })
            expect(big.status).toBe('PENDING')
            await requests.cancelRequest(big.id, { reason: 'teste' })
        })
    })

    describe('consulta', () => {
        it('detalhe com família, itens e disponível por linha', async () => {
            const detail = await requests.getRequest(request.id)
            check(detail, SHAPES.requestDetail, 'detalhe da solicitação')
            expect(detail.items).toHaveLength(2)
            expect(detail.items.find((line) => line.itemId === world.kg.id)).toMatchObject({
                requestedQty: 10,
                available: 100,
            })
            expect(detail.beneficiary.id).toBe(world.family.id)
        })

        it('id inexistente → 404', async () => {
            await expectStatus(requests.getRequest(999999), 404)
        })

        it('lista no formato paginado + counts por status e ALL', async () => {
            const page = await requests.listRequests()
            check(page, SHAPES.requestList, 'lista de solicitações')
            const total = [
                'PENDING',
                'APPROVED',
                'REJECTED',
                'PICKED',
                'DELIVERED',
                'CANCELLED',
            ].reduce((sum, key) => sum + (page.counts[key] ?? 0), 0)
            expect(page.counts.ALL).toBe(total)
        })

        it('filtro por status devolve só o status e counts continuam completos', async () => {
            const page = await requests.listRequests({ status: 'PENDING' })
            expect(page.content.length).toBeGreaterThan(0)
            expect(page.content.every((row) => row.status === 'PENDING')).toBe(true)
            expect(page.counts.ALL).toBeGreaterThanOrEqual(page.counts.PENDING)
        })

        it('busca pelo nome da família e por id (com ou sem #)', async () => {
            const byName = await requests.listRequests({
                search: world.family.responsibleName.toUpperCase(),
            })
            expect(byName.content.map((row) => row.id)).toContain(request.id)
            const byId = await requests.listRequests({ search: String(request.id) })
            expect(byId.content.map((row) => row.id)).toContain(request.id)
            const byHash = await requests.listRequests({ search: `#${request.id}` })
            expect(byHash.content.map((row) => row.id)).toContain(request.id)
        })

        it('filtro por período (from/to) e por solicitante', async () => {
            const inRange = await requests.listRequests({
                from: today(),
                to: today(),
                search: world.family.responsibleName,
            })
            expect(inRange.content.map((row) => row.id)).toContain(request.id)
            const past = await requests.listRequests({ from: '2000-01-01', to: '2000-12-31' })
            expect(past.content).toEqual([])
            const operator = (await users.listUserOptions()).find((user) =>
                /operador/i.test(user.name),
            )
            const byUser = await requests.listRequests({
                requestedById: operator.id,
                search: world.family.responsibleName,
            })
            expect(byUser.content.map((row) => row.id)).toContain(request.id)
        })

        it('mais recentes primeiro', async () => {
            const { content } = await requests.listRequests()
            const dates = content.map((row) => row.createdAt)
            expect(dates).toEqual([...dates].sort().reverse())
        })

        it('data inválida no filtro → 400', async () => {
            await expectStatus(requests.listRequests({ from: 'ontem' }), 400)
        })
    })

    describe('análise (decisão) - só coordenador', () => {
        const decide = (id, body) => requests.decideRequest(id, body)

        it('operador → 403', async () => {
            await signInAs(OPERATOR)
            await expectStatus(decide(request.id, { decision: 'REJECT', justification: 'x' }), 403)
            await signInAs(COORDINATOR)
        })

        it('decisão inexistente → 400', async () => {
            await expectStatus(decide(request.id, { decision: 'TALVEZ' }), 400)
        })

        it('decisão ausente → 400 com fieldErrors.decision', async () => {
            await expectFieldError(decide(request.id, {}), 'decision')
        })

        it('aprovado acima do solicitado → fieldErrors.approved[<linha>]', async () => {
            const detail = await requests.getRequest(request.id)
            const line = detail.items[0]
            const error = await expectStatus(
                decide(request.id, {
                    decision: 'APPROVE',
                    items: detail.items.map((entry) => ({
                        id: entry.id,
                        approvedQty: entry.id === line.id ? line.requestedQty + 1 : 0,
                    })),
                }),
                400,
            )
            expect(error.fieldErrors.approved[line.id]).toBeTruthy()
        })

        it('aprovação parcial sem justificativa → fieldErrors.justification', async () => {
            const detail = await requests.getRequest(request.id)
            const error = await expectStatus(
                decide(request.id, {
                    decision: 'APPROVE',
                    items: detail.items.map((entry, index) => ({
                        id: entry.id,
                        approvedQty: index === 0 ? entry.requestedQty - 1 : entry.requestedQty,
                    })),
                }),
                400,
            )
            expect(error.fieldErrors.justification).toBeTruthy()
        })

        it('linha que não pertence à solicitação → 400', async () => {
            await expectOneOfStatus(
                decide(request.id, {
                    decision: 'APPROVE',
                    items: [{ id: 999999, approvedQty: 1 }],
                }),
                [400, 404],
            )
        })

        it('recusa exige justificativa', async () => {
            await expectFieldError(decide(request.id, { decision: 'REJECT' }), 'justification')
        })

        it('recusa com justificativa → REJECTED (estado final)', async () => {
            const other = await create()
            const rejected = await decide(other.id, {
                decision: 'REJECT',
                justification: 'Sem perfil',
            })
            expect(rejected).toEqual({ id: other.id, status: 'REJECTED' })
            await expectStatus(
                decide(other.id, { decision: 'REJECT', justification: 'de novo' }),
                409,
            )
            const detail = await requests.getRequest(other.id)
            expect(detail.justification).toBe('Sem perfil')
            expect(detail.decidedBy).toBeTruthy()
        })

        it('aprova integralmente → APPROVED, ainda sem reserva (RN17)', async () => {
            const detail = await requests.getRequest(request.id)
            const approved = await decide(request.id, {
                decision: 'APPROVE',
                items: detail.items.map((line) => ({
                    id: line.id,
                    approvedQty: line.requestedQty,
                })),
            })
            expect(approved).toEqual({ id: request.id, status: 'APPROVED' })
            expect(await stockRow(world.kg.id)).toMatchObject({ reserved: 0 })
        })

        it('decidir de novo uma solicitação já decidida → 409', async () => {
            await expectStatus(decide(request.id, { decision: 'REJECT', justification: 'x' }), 409)
        })

        it('entregar antes de separar → 409', async () => {
            await expectStatus(requests.deliverRequest(request.id, {}), 409)
        })

        it('aprovação parcial com justificativa e quantidade zero em uma linha', async () => {
            const partial = await create()
            const detail = await requests.getRequest(partial.id)
            const approved = await decide(partial.id, {
                decision: 'APPROVE',
                justification: 'Só há arroz suficiente',
                items: detail.items.map((line) => ({
                    id: line.id,
                    approvedQty: line.itemId === world.kg.id ? 6 : 0,
                })),
            })
            expect(approved.status).toBe('APPROVED')
            const after = await requests.getRequest(partial.id)
            expect(after.items.find((line) => line.itemId === world.kg.id).approvedQty).toBe(6)
            expect(after.items.find((line) => line.itemId === world.unit.id).approvedQty).toBe(0)
            await requests.cancelRequest(partial.id, { reason: 'limpeza do teste' })
        })

        it('aprovar com todas as linhas zeradas equivale a recusa (D-06)', async () => {
            const zero = await create()
            const detail = await requests.getRequest(zero.id)
            const result = await decide(zero.id, {
                decision: 'APPROVE',
                justification: 'Nada disponível',
                items: detail.items.map((line) => ({ id: line.id, approvedQty: 0 })),
            })
            expect(result.status).toBe('REJECTED')
        })
    })

    describe('separação, entrega e estoque', () => {
        it('separar reserva o estoque (disponível cai, físico fica)', async () => {
            const picked = await requests.pickRequest(request.id)
            expect(picked).toEqual({ id: request.id, status: 'PICKED' })
            expect(await stockRow(world.kg.id)).toMatchObject({
                physical: 100,
                reserved: 10,
                available: 90,
            })
            expect(await stockRow(world.unit.id)).toMatchObject({
                physical: 50,
                reserved: 4,
                available: 46,
            })
        })

        it('separar de novo → 409', async () => {
            await expectStatus(requests.pickRequest(request.id), 409)
        })

        it('detalhe registra quem separou e quando', async () => {
            const detail = await requests.getRequest(request.id)
            expect(detail.status).toBe('PICKED')
            expect(detail.pickedBy).toBeTruthy()
            expect(detail.pickedAt).toBeTruthy()
        })

        it('observação da entrega acima de 300 caracteres → 400', async () => {
            await expectStatus(requests.deliverRequest(request.id, { notes: 'n'.repeat(301) }), 400)
        })

        it('entregar baixa o físico e zera a reserva', async () => {
            const delivered = await requests.deliverRequest(request.id, {
                notes: 'Retirada pelo responsável',
            })
            expect(delivered).toEqual({ id: request.id, status: 'DELIVERED' })
            expect(await stockRow(world.kg.id)).toMatchObject({
                physical: 90,
                reserved: 0,
                available: 90,
            })
            expect(await stockRow(world.unit.id)).toMatchObject({
                physical: 46,
                reserved: 0,
                available: 46,
            })
        })

        it('detalhe da entrega: quem entregou, quando e observação', async () => {
            const detail = await requests.getRequest(request.id)
            expect(detail.delivery).toMatchObject({ notes: 'Retirada pelo responsável' })
            expect(detail.delivery.deliveredBy).toBeTruthy()
        })

        it('entregar ou cancelar solicitação já entregue → 409', async () => {
            await expectStatus(requests.deliverRequest(request.id, {}), 409)
            await expectStatus(requests.cancelRequest(request.id, { reason: 'tarde demais' }), 409)
        })

        it('histórico e resumo da família refletem a entrega', async () => {
            const summary = await requests.getDeliverySummary(world.family.id)
            check(summary, SHAPES.deliverySummary, 'resumo')
            expect(summary.lastDelivery.requestId).toBe(request.id)
            expect(summary.recentDeliveries).toHaveLength(1)
            expect(summary.lastDelivery.items.map((item) => item.itemName)).toContain(world.kg.name)

            const history = await requests.getFamilyHistory(world.family.id)
            check(history, SHAPES.familyHistory, 'histórico')
            expect(history.requests.map((row) => row.id)).toContain(request.id)
            expect(history.deliveries).toHaveLength(1)
        })

        it('separar com estoque insuficiente → 409/422 e nada é reservado', async () => {
            const scarce = await catalog.createItem({
                categoryId: world.category.id,
                name: unique('Escasso'),
                unitOfMeasure: 'UNIT',
            })
            await entries.createEntry({
                anonymous: true,
                items: [{ itemId: scarce.id, quantity: 5 }],
            })
            const created = await create({ lines: [{ itemId: scarce.id, requestedQty: 5 }] })
            const detail = await requests.getRequest(created.id)
            await requests.decideRequest(created.id, {
                decision: 'APPROVE',
                items: detail.items.map((line) => ({ id: line.id, approvedQty: 5 })),
            })
            await stock.createAdjustment({
                itemId: scarce.id,
                quantity: 3,
                adjustmentReason: 'LOSS',
                notes: 'sumiu',
            })
            await expectOneOfStatus(requests.pickRequest(created.id), [409, 422])
            expect(await stockRow(scarce.id)).toMatchObject({ reserved: 0 })
            await requests.cancelRequest(created.id, { reason: 'limpeza do teste' })
        })
    })

    describe('cancelamento', () => {
        const approvedRequest = async () => {
            const created = await create({ lines: [{ itemId: world.kg.id, requestedQty: 3 }] })
            const detail = await requests.getRequest(created.id)
            await requests.decideRequest(created.id, {
                decision: 'APPROVE',
                items: detail.items.map((line) => ({ id: line.id, approvedQty: 3 })),
            })
            return created
        }

        it('motivo é obrigatório → 400 com fieldErrors.reason', async () => {
            const created = await create()
            await expectFieldError(requests.cancelRequest(created.id, { reason: '' }), 'reason')
            await expectFieldError(requests.cancelRequest(created.id, {}), 'reason')
        })

        it('cancela pendente, registra motivo e quem cancelou', async () => {
            const created = await create()
            const cancelled = await requests.cancelRequest(created.id, {
                reason: 'Família desistiu',
            })
            expect(cancelled).toEqual({ id: created.id, status: 'CANCELLED' })
            const detail = await requests.getRequest(created.id)
            expect(detail).toMatchObject({ cancellationReason: 'Família desistiu' })
            expect(detail.cancelledBy).toBeTruthy()
        })

        it('cancelar solicitação separada libera a reserva', async () => {
            const created = await approvedRequest()
            await requests.pickRequest(created.id)
            const reserved = await stockRow(world.kg.id)
            expect(reserved.reserved).toBe(3)
            await requests.cancelRequest(created.id, { reason: 'Mudança de planos' })
            expect(await stockRow(world.kg.id)).toMatchObject({
                reserved: 0,
                available: reserved.available + 3,
            })
        })

        it('cancelar solicitação já cancelada → 409', async () => {
            const created = await create()
            await requests.cancelRequest(created.id, { reason: 'x' })
            await expectStatus(requests.cancelRequest(created.id, { reason: 'y' }), 409)
        })

        it('solicitação inexistente → 404 em todas as ações', async () => {
            await expectStatus(requests.pickRequest(999999), 404)
            await expectStatus(requests.deliverRequest(999999, {}), 404)
            await expectStatus(requests.cancelRequest(999999, { reason: 'x' }), 404)
            await expectStatus(
                requests.decideRequest(999999, { decision: 'REJECT', justification: 'x' }),
                404,
            )
        })
    })

    describe('regra D-09 (inativar família com solicitação em andamento)', () => {
        it('bloqueia enquanto há solicitação pendente e libera depois do cancelamento', async () => {
            const family = await beneficiaries.createBeneficiary({
                responsibleName: unique('D09'),
                householdSize: 2,
            })
            const created = await requests.createRequest({
                beneficiaryId: family.id,
                lines: [{ itemId: world.kg.id, requestedQty: 1 }],
            })
            const error = await expectOneOfStatus(
                beneficiaries.setBeneficiaryStatus(family.id, 'INACTIVE'),
                [409, 422],
            )
            expect(error.message).toMatch(/solicitação em andamento/i)
            await requests.cancelRequest(created.id, { reason: 'teste D-09' })
            expect((await beneficiaries.setBeneficiaryStatus(family.id, 'INACTIVE')).status).toBe(
                'INACTIVE',
            )
        })
    })
})

describe.skipIf(!up)('movimentações', () => {
    let adjustment
    beforeAll(async () => {
        await prepareWorld()
        adjustment = await stock.createAdjustment({
            itemId: world.kg.id,
            quantity: 4,
            adjustmentReason: 'DAMAGE',
            notes: 'embalagem rasgada',
        })
    })

    it('lista paginada com referência, no formato das telas', async () => {
        const page = await movements.listMovements()
        check(page, pageOf(SHAPES.movement), 'lista de movimentações')
        expect(page.size).toBe(10)
    })

    it('referência de entrada aponta para a entrada; de ajuste descreve o motivo', async () => {
        const { content } = await movements.listMovements({ itemId: world.kg.id })
        const entry = content.find((row) => row.type === 'ENTRY')
        expect(entry.reference).toMatchObject({ entryId: world.entry.id })
        expect(entry.reference.label).toMatch(new RegExp(`Entrada #${world.entry.id}`))
        const found = content.find((row) => row.id === adjustment.id)
        expect(found.reference.label).toMatch(/Ajuste - Avaria/)
    })

    it('mais recentes primeiro', async () => {
        const { content } = await movements.listMovements()
        const dates = content.map((row) => row.occurredAt)
        expect(dates).toEqual([...dates].sort().reverse())
    })

    it('filtros: item, tipo, usuário e período', async () => {
        const byItem = await movements.listMovements({ itemId: world.kg.id })
        expect(byItem.content.every((row) => row.itemId === world.kg.id)).toBe(true)

        const byType = await movements.listMovements({ itemId: world.kg.id, type: 'ADJUSTMENT' })
        expect(byType.content.length).toBeGreaterThan(0)
        expect(byType.content.every((row) => row.type === 'ADJUSTMENT')).toBe(true)

        const byUser = await movements.listMovements({
            itemId: world.kg.id,
            userId: adjustment.userId,
        })
        expect(byUser.content.every((row) => row.userId === adjustment.userId)).toBe(true)

        const today_ = await movements.listMovements({
            itemId: world.kg.id,
            from: today(),
            to: today(),
        })
        expect(today_.content.length).toBeGreaterThan(0)
        const past = await movements.listMovements({ from: '2000-01-01', to: '2000-01-02' })
        expect(past.content).toEqual([])
    })

    it('paginação: size e page', async () => {
        const first = await httpClient.get('/movements', { size: 2, page: 0 })
        const second = await httpClient.get('/movements', { size: 2, page: 1 })
        expect(first.content).toHaveLength(2)
        expect(first.content.map((row) => row.id)).not.toEqual(second.content.map((row) => row.id))
        expect(first.totalPages).toBe(Math.ceil(first.totalElements / 2))
    })

    it('tipo inexistente / data inválida → 400', async () => {
        await expectStatus(movements.listMovements({ type: 'TELEPORTE' }), 400)
        await expectStatus(movements.listMovements({ from: 'x' }), 400)
    })

    it('detalhe com original e estorno nulos quando não há estorno', async () => {
        const detail = await movements.getMovement(adjustment.id)
        check(detail, SHAPES.movementDetail, 'detalhe da movimentação')
        expect(detail.original ?? null).toBeNull()
        expect(detail.reversal ?? null).toBeNull()
    })

    it('id inexistente → 404', async () => {
        await expectStatus(movements.getMovement(999999), 404)
    })

    describe('estorno (só coordenador)', () => {
        it('justificativa obrigatória → 400 com fieldErrors.justification', async () => {
            await expectFieldError(
                movements.reverseMovement(adjustment.id, {
                    justification: '',
                    itemsReturned: false,
                }),
                'justification',
            )
        })

        it('justificativa acima de 300 caracteres → 400', async () => {
            await expectStatus(
                movements.reverseMovement(adjustment.id, {
                    justification: 'j'.repeat(301),
                    itemsReturned: false,
                }),
                400,
            )
        })

        it('operador → 403', async () => {
            await signInAs(OPERATOR)
            await expectStatus(
                movements.reverseMovement(adjustment.id, {
                    justification: 'x',
                    itemsReturned: false,
                }),
                403,
            )
            await signInAs(COORDINATOR)
        })

        it('estorno inexistente → 404', async () => {
            await expectStatus(
                movements.reverseMovement(999999, { justification: 'x', itemsReturned: false }),
                404,
            )
        })

        it('estorna o ajuste: devolve o saldo e liga original ↔ estorno', async () => {
            const before = await stockRow(world.kg.id)
            const reversal = await movements.reverseMovement(adjustment.id, {
                justification: 'Lançado por engano',
                itemsReturned: false,
            })
            check(reversal, SHAPES.movement, 'estorno')
            expect(reversal).toMatchObject({
                type: 'REVERSAL',
                reversesId: adjustment.id,
                quantity: 4,
            })

            const after = await stockRow(world.kg.id)
            expect(after.physical).toBeCloseTo(before.physical + 4, 3)

            const original = await movements.getMovement(adjustment.id)
            expect(original.reversedById).toBe(reversal.id)
            expect(original.reversal.id).toBe(reversal.id)
            const detail = await movements.getMovement(reversal.id)
            expect(detail.original.id).toBe(adjustment.id)
            expect(detail.reference.label).toMatch(
                new RegExp(`Estorno do lançamento #${adjustment.id}`),
            )
        })

        it('estornar de novo o mesmo lançamento → 409/422', async () => {
            await expectOneOfStatus(
                movements.reverseMovement(adjustment.id, {
                    justification: 'de novo',
                    itemsReturned: false,
                }),
                [409, 422],
            )
        })

        it('não se estorna um estorno → 409/422', async () => {
            const original = await movements.getMovement(adjustment.id)
            await expectOneOfStatus(
                movements.reverseMovement(original.reversedById, {
                    justification: 'x',
                    itemsReturned: false,
                }),
                [409, 422],
            )
        })

        it('estorno de entrega exige confirmar o retorno dos itens (itemsReturned) → fieldErrors.itemsReturned', async () => {
            const family = await beneficiaries.createBeneficiary({
                responsibleName: unique('Estorno'),
                householdSize: 1,
            })
            const created = await requests.createRequest({
                beneficiaryId: family.id,
                lines: [{ itemId: world.unit.id, requestedQty: 1 }],
            })
            const detail = await requests.getRequest(created.id)
            await requests.decideRequest(created.id, {
                decision: 'APPROVE',
                items: detail.items.map((line) => ({ id: line.id, approvedQty: 1 })),
            })
            await requests.pickRequest(created.id)
            await requests.deliverRequest(created.id, {})
            const delivery = (
                await movements.listMovements({ itemId: world.unit.id, type: 'DELIVERY' })
            ).content[0]

            await expectFieldError(
                movements.reverseMovement(delivery.id, {
                    justification: 'Entrega errada',
                    itemsReturned: false,
                }),
                'itemsReturned',
            )
            const before = await stockRow(world.unit.id)
            const reversal = await movements.reverseMovement(delivery.id, {
                justification: 'Entrega errada',
                itemsReturned: true,
            })
            expect(reversal.type).toBe('REVERSAL')
            expect((await stockRow(world.unit.id)).physical).toBeCloseTo(before.physical + 1, 3)
        })
    })
})

describe.skipIf(!up)('dashboard', () => {
    beforeAll(prepareWorld)

    const period = () => ({
        from: new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10),
        to: today(),
    })

    it('devolve todos os blocos usados pela tela', async () => {
        const summary = await dashboard.getDashboard(period())
        check(summary, SHAPES.dashboard, 'dashboard')
    })

    it('contadores refletem os dados criados no período', async () => {
        const summary = await dashboard.getDashboard(period())
        expect(summary.activeItems).toBeGreaterThanOrEqual(2)
        expect(summary.activeCategories).toBeGreaterThanOrEqual(1)
        expect(summary.entriesInPeriod).toBeGreaterThanOrEqual(1)
    })

    it('período no passado remoto zera entradas e entregas, mas estoque continua atual', async () => {
        const summary = await dashboard.getDashboard({ from: '2000-01-01', to: '2000-01-31' })
        expect(summary.entriesInPeriod).toBe(0)
        expect(summary.deliveriesInPeriod).toBe(0)
        expect(summary.activeItems).toBeGreaterThanOrEqual(2)
    })

    it('período anterior (previous) tem o mesmo formato de totais', async () => {
        const summary = await dashboard.getDashboard(period())
        expect(Object.keys(summary.previous).sort()).toEqual(['deliveries', 'entries'])
    })

    it('movimentações recentes e pendências têm tamanho limitado', async () => {
        const summary = await dashboard.getDashboard(period())
        expect(summary.recentMovements.length).toBeLessThanOrEqual(20)
        expect(summary.topCritical.length).toBeLessThanOrEqual(20)
    })

    it('série mensal usa o formato yyyy-MM', async () => {
        const summary = await dashboard.getDashboard(period())
        summary.monthly.forEach((point) => expect(point.month).toMatch(/^\d{4}-\d{2}$/))
    })

    it('sem período usa um padrão e responde 200', async () => {
        check(await httpClient.get('/dashboard'), SHAPES.dashboard, 'dashboard')
    })

    it('data inválida → 400', async () => {
        await expectStatus(dashboard.getDashboard({ from: 'x', to: today() }), 400)
    })

    it('operador também enxerga o dashboard', async () => {
        await signInAs(OPERATOR)
        check(await dashboard.getDashboard(period()), SHAPES.dashboard, 'dashboard')
        await signInAs(COORDINATOR)
    })
})
