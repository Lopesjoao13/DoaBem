import { beforeAll, describe, it } from 'vitest'
import * as beneficiaries from '@/services/beneficiaryService.js'
import * as catalog from '@/services/catalogService.js'
import * as entries from '@/services/entryService.js'
import * as requests from '@/services/requestService.js'
import * as stock from '@/services/stockService.js'
import { COORDINATOR, expectStatus, isBackendUp, signInAs, unique } from './helpers.js'

// O backend só aceita números JSON. Os formulários precisam converter o que o usuário digita
// (texto, vírgula decimal) antes de chamar os services; os testes de tela conferem essa conversão.
// Aqui fica registrado o que o backend faz com um payload "cru".
const up = await isBackendUp()
const world = {}

describe.skipIf(!up)('backend recusa payloads não numéricos', () => {
    beforeAll(async () => {
        await signInAs(COORDINATOR)
        world.category = await catalog.createCategory({ name: unique('CatForm') })
        world.kg = await catalog.createItem({
            categoryId: world.category.id,
            name: unique('Feijão'),
            unitOfMeasure: 'KG',
        })
        world.family = await beneficiaries.createBeneficiary({
            responsibleName: unique('Fam Form'),
            householdSize: 2,
        })
        await entries.createEntry({
            anonymous: true,
            items: [{ itemId: world.kg.id, quantity: 100 }],
        })
    })

    it('ajuste com quantidade em vírgula decimal → 400', async () => {
        await expectStatus(
            stock.createAdjustment({
                itemId: world.kg.id,
                quantity: '2,5',
                adjustmentReason: 'LOSS',
                notes: 'x',
            }),
            400,
        )
    })

    it('solicitação com quantidade em vírgula decimal → 400', async () => {
        await expectStatus(
            requests.createRequest({
                beneficiaryId: world.family.id,
                lines: [{ itemId: world.kg.id, requestedQty: '3,5' }],
            }),
            400,
        )
    })

    it('ajuste com número válido é aceito (formato que os formulários enviam)', async () => {
        await stock.createAdjustment({
            itemId: world.kg.id,
            quantity: 2.5,
            adjustmentReason: 'LOSS',
            notes: 'x',
        })
    })

    it('solicitação com campos extras (key) é aceita', async () => {
        await requests.createRequest({
            beneficiaryId: world.family.id,
            lines: [{ key: 'line-1', itemId: world.kg.id, requestedQty: 3.5 }],
        })
    })
})
