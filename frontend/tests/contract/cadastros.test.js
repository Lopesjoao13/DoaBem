import { beforeAll, describe, expect, it } from 'vitest'
import { SHAPES, pageOf } from '@/test/shapes.js'
import { httpClient } from '@/services/httpClient.js'
import * as beneficiaries from '@/services/beneficiaryService.js'
import * as catalog from '@/services/catalogService.js'
import * as users from '@/services/userService.js'
import {
    COORDINATOR,
    check,
    expectFieldError,
    expectOneOfStatus,
    expectStatus,
    isBackendUp,
    signInAs,
    signOut,
    unique,
} from './helpers.js'

const up = await isBackendUp()
const emailOf = (label) => `${unique(label).replace(/\s/g, '').toLowerCase()}@doabem.test`

describe.skipIf(!up)('usuários', () => {
    let created
    const payload = () => ({
        name: unique('Usuário'),
        email: emailOf('u'),
        password: 'senha1234',
        role: 'OPERATOR',
    })

    beforeAll(async () => {
        await signInAs(COORDINATOR)
    })

    it('cria usuário (201) sem devolver a senha', async () => {
        created = await users.createUser(payload())
        check(created, SHAPES.user, 'usuário criado')
        expect(created.active).toBe(true)
        expect(created).not.toHaveProperty('password')
    })

    it('e-mail duplicado → 409', async () => {
        await expectStatus(users.createUser({ ...payload(), email: created.email }), 409)
    })

    it('e-mail duplicado ignora maiúsculas', async () => {
        await expectOneOfStatus(
            users.createUser({ ...payload(), email: created.email.toUpperCase() }),
            [409],
        )
    })

    it.each([
        ['nome vazio', { name: '' }, 'name'],
        ['e-mail inválido', { email: 'sem-arroba' }, 'email'],
        ['senha curta (< 8)', { password: '1234567' }, 'password'],
        ['senha longa (> 72)', { password: 'x'.repeat(73) }, 'password'],
        ['perfil ausente', { role: null }, 'role'],
    ])('validação: %s → 400 com fieldErrors.%s', async (_name, override, field) => {
        await expectFieldError(users.createUser({ ...payload(), ...override }), field)
    })

    it('perfil inexistente → 400', async () => {
        await expectStatus(users.createUser({ ...payload(), role: 'ADMIN' }), 400)
    })

    it('busca por id', async () => {
        const found = await users.getUser(created.id)
        check(found, SHAPES.user, 'usuário')
        expect(found.email).toBe(created.email)
    })

    it('id inexistente → 404', async () => {
        await expectStatus(users.getUser(999999), 404)
    })

    it('atualiza nome, e-mail e perfil', async () => {
        const email = emailOf('upd')
        const updated = await users.updateUser(created.id, {
            name: 'Renomeado',
            email,
            role: 'COORDINATOR',
        })
        expect(updated).toMatchObject({
            id: created.id,
            name: 'Renomeado',
            email,
            role: 'COORDINATOR',
        })
    })

    it('atualizar com e-mail de outro usuário → 409', async () => {
        const other = await users.createUser(payload())
        await expectStatus(
            users.updateUser(created.id, { name: 'x', email: other.email, role: 'OPERATOR' }),
            409,
        )
    })

    it('inativa e reativa', async () => {
        const off = await users.setUserActive(created.id, false)
        expect(off.active).toBe(false)
        const on = await users.setUserActive(created.id, true)
        expect(on.active).toBe(true)
    })

    it('usuário inativo não consegue entrar', async () => {
        const account = { ...payload() }
        const fresh = await users.createUser(account)
        await users.setUserActive(fresh.id, false)
        const { login } = await import('@/services/authService.js')
        signOut()
        await expectStatus(login(account.email, account.password), 401)
        await signInAs(COORDINATOR)
    })

    it('usuário novo consegue entrar com a senha cadastrada', async () => {
        const account = payload()
        await users.createUser(account)
        const { login } = await import('@/services/authService.js')
        signOut()
        const session = await login(account.email, account.password)
        expect(session.user.role).toBe('OPERATOR')
        await signInAs(COORDINATOR)
    })

    it('coordenador não pode se inativar', async () => {
        const me = (await users.listUsers()).content.find(
            (user) => user.email === COORDINATOR.email,
        )
        await expectOneOfStatus(users.setUserActive(me.id, false), [409, 422])
    })

    it('lista paginada no formato achatado, ordenada por nome', async () => {
        const page = await users.listUsers()
        check(page, pageOf(SHAPES.user), 'lista de usuários')
        const names = page.content.map((user) => user.name)
        expect(names).toEqual(
            [...names].sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' })),
        )
    })

    it('paginação: size=1 devolve 1 item e totalPages = total', async () => {
        const page = await httpClient.get('/users', { page: 0, size: 1 })
        expect(page.content).toHaveLength(1)
        expect(page.size).toBe(1)
        expect(page.totalPages).toBe(page.totalElements)
    })

    it('página além do fim vem vazia mas com os totais', async () => {
        const page = await httpClient.get('/users', { page: 9999, size: 10 })
        expect(page.content).toEqual([])
        expect(page.totalElements).toBeGreaterThan(0)
    })

    it('opções de usuário: só id e nome', async () => {
        const options = await users.listUserOptions()
        options.forEach((option) => check(option, SHAPES.userOption, 'opção de usuário'))
        expect(Object.keys(options[0]).sort()).toEqual(['id', 'name'])
    })
})

describe.skipIf(!up)('categorias', () => {
    let category

    beforeAll(async () => {
        await signInAs(COORDINATOR)
    })

    it('cria categoria (201)', async () => {
        category = await catalog.createCategory({
            name: unique('Categoria'),
            description: 'Descrição',
        })
        check(category, SHAPES.category, 'categoria')
        expect(category.active).toBe(true)
    })

    it('descrição é opcional', async () => {
        const created = await catalog.createCategory({ name: unique('SemDescricao') })
        check(created, SHAPES.category, 'categoria')
    })

    it('nome duplicado → 409 (ignora maiúsculas)', async () => {
        await expectStatus(catalog.createCategory({ name: category.name.toUpperCase() }), 409)
    })

    it.each([
        ['nome vazio', { name: '' }, 'name'],
        ['nome com mais de 80 caracteres', { name: 'x'.repeat(81) }, 'name'],
        [
            'descrição com mais de 200 caracteres',
            { name: 'ok', description: 'x'.repeat(201) },
            'description',
        ],
    ])('validação: %s → 400 com fieldErrors.%s', async (_name, body, field) => {
        await expectFieldError(catalog.createCategory(body), field)
    })

    it('busca por id e 404 para inexistente', async () => {
        check(await catalog.getCategory(category.id), SHAPES.category, 'categoria')
        await expectStatus(catalog.getCategory(999999), 404)
    })

    it('atualiza', async () => {
        const name = unique('Atualizada')
        const updated = await catalog.updateCategory(category.id, { name, description: null })
        expect(updated).toMatchObject({ id: category.id, name })
    })

    it('inativa e filtra por active', async () => {
        const off = await catalog.setCategoryActive(category.id, false)
        expect(off.active).toBe(false)
        const inactive = await catalog.listCategories({ active: false })
        expect(inactive.content.every((entry) => entry.active === false)).toBe(true)
        expect(inactive.content.map((entry) => entry.id)).toContain(category.id)
        const active = await catalog.listCategories({ active: true })
        expect(active.content.map((entry) => entry.id)).not.toContain(category.id)
        await catalog.setCategoryActive(category.id, true)
    })

    it('lista paginada ordenada por nome', async () => {
        const page = await catalog.listCategories()
        check(page, pageOf(SHAPES.category), 'lista de categorias')
    })
})

describe.skipIf(!up)('itens', () => {
    let category
    let item

    beforeAll(async () => {
        await signInAs(COORDINATOR)
        category = await catalog.createCategory({ name: unique('CatItens') })
    })

    it('cria item (201) com unidade e estoque mínimo', async () => {
        item = await catalog.createItem({
            categoryId: category.id,
            name: unique('Arroz'),
            unitOfMeasure: 'KG',
            minStock: 5,
        })
        check(item, SHAPES.item, 'item')
        expect(item).toMatchObject({
            categoryId: category.id,
            categoryName: category.name,
            unitOfMeasure: 'KG',
            status: 'ACTIVE',
        })
        expect(item.minStock).toBe(5)
    })

    it('estoque mínimo é opcional (padrão 0)', async () => {
        const created = await catalog.createItem({
            categoryId: category.id,
            name: unique('SemMin'),
            unitOfMeasure: 'UNIT',
        })
        expect(created.minStock).toBe(0)
    })

    it('mesmo nome na mesma categoria → 409', async () => {
        await expectStatus(
            catalog.createItem({ categoryId: category.id, name: item.name, unitOfMeasure: 'KG' }),
            409,
        )
    })

    it('mesmo nome em outra categoria é permitido', async () => {
        const other = await catalog.createCategory({ name: unique('Outra') })
        const created = await catalog.createItem({
            categoryId: other.id,
            name: item.name,
            unitOfMeasure: 'KG',
        })
        expect(created.id).not.toBe(item.id)
    })

    it('categoria inexistente → 404 ou 422', async () => {
        await expectOneOfStatus(
            catalog.createItem({ categoryId: 999999, name: unique('X'), unitOfMeasure: 'KG' }),
            [404, 422],
        )
    })

    it('categoria inativa não aceita itens novos', async () => {
        const inactive = await catalog.createCategory({ name: unique('Inativa') })
        await catalog.setCategoryActive(inactive.id, false)
        await expectOneOfStatus(
            catalog.createItem({ categoryId: inactive.id, name: unique('X'), unitOfMeasure: 'KG' }),
            [409, 422],
        )
    })

    it.each([
        ['nome vazio', { name: '' }, 'name'],
        ['categoria ausente', { categoryId: null }, 'categoryId'],
        ['unidade ausente', { unitOfMeasure: null }, 'unitOfMeasure'],
        ['estoque mínimo negativo', { minStock: -1 }, 'minStock'],
        ['estoque mínimo com 4 casas decimais', { minStock: 1.2345 }, 'minStock'],
    ])('validação: %s → 400 com fieldErrors.%s', async (_name, override, field) => {
        await expectFieldError(
            catalog.createItem({
                categoryId: category.id,
                name: unique('V'),
                unitOfMeasure: 'KG',
                ...override,
            }),
            field,
        )
    })

    it('unidade inexistente → 400', async () => {
        await expectStatus(
            catalog.createItem({
                categoryId: category.id,
                name: unique('V'),
                unitOfMeasure: 'METRO',
            }),
            400,
        )
    })

    it('busca por id e 404', async () => {
        check(await catalog.getItem(item.id), SHAPES.item, 'item')
        await expectStatus(catalog.getItem(999999), 404)
    })

    it('atualiza nome e estoque mínimo, mantendo a unidade', async () => {
        const name = unique('Renomeado')
        const updated = await catalog.updateItem(item.id, {
            categoryId: category.id,
            name,
            minStock: 9,
        })
        expect(updated).toMatchObject({ name, minStock: 9, unitOfMeasure: 'KG' })
        item = updated
    })

    it('atualização exige estoque mínimo', async () => {
        await expectFieldError(
            catalog.updateItem(item.id, { categoryId: category.id, name: 'x' }),
            'minStock',
        )
    })

    it('inativa e reativa', async () => {
        expect((await catalog.setItemStatus(item.id, 'INACTIVE')).status).toBe('INACTIVE')
        expect((await catalog.setItemStatus(item.id, 'ACTIVE')).status).toBe('ACTIVE')
    })

    it('status inexistente → 400', async () => {
        await expectStatus(catalog.setItemStatus(item.id, 'PAUSED'), 400)
    })

    it('filtros: status, categoryId e busca por nome (sem diferenciar maiúsculas)', async () => {
        const byCategory = await catalog.listItems({ categoryId: category.id })
        expect(byCategory.content.length).toBeGreaterThan(0)
        expect(byCategory.content.every((entry) => entry.categoryId === category.id)).toBe(true)

        const search = await catalog.listItems({ search: item.name.slice(0, 6).toUpperCase() })
        expect(search.content.map((entry) => entry.id)).toContain(item.id)

        await catalog.setItemStatus(item.id, 'INACTIVE')
        const inactive = await catalog.listItems({ status: 'INACTIVE', categoryId: category.id })
        expect(inactive.content.map((entry) => entry.id)).toEqual([item.id])
        const active = await catalog.listItems({ status: 'ACTIVE', categoryId: category.id })
        expect(active.content.map((entry) => entry.id)).not.toContain(item.id)
        await catalog.setItemStatus(item.id, 'ACTIVE')
    })

    it('lista paginada e formato', async () => {
        check(await catalog.listItems(), pageOf(SHAPES.item), 'lista de itens')
    })
})

describe.skipIf(!up)('famílias (beneficiários)', () => {
    let family
    const payload = () => ({
        responsibleName: unique('Família'),
        phone: '47999990000',
        neighborhood: 'Centro',
        householdSize: 4,
        notes: 'obs',
    })

    beforeAll(async () => {
        await signInAs(COORDINATOR)
    })

    it('cria família (201) ativa', async () => {
        family = await beneficiaries.createBeneficiary(payload())
        check(family, SHAPES.beneficiary, 'família')
        expect(family).toMatchObject({ status: 'ACTIVE', householdSize: 4, neighborhood: 'Centro' })
    })

    it('telefone, bairro e observações são opcionais', async () => {
        const created = await beneficiaries.createBeneficiary({
            responsibleName: unique('Mínima'),
            householdSize: 1,
        })
        check(created, SHAPES.beneficiary, 'família')
        expect(created.phone ?? null).toBeNull()
    })

    it.each([
        ['nome vazio', { responsibleName: '' }, 'responsibleName'],
        ['integrantes ausente', { householdSize: null }, 'householdSize'],
        ['integrantes zero', { householdSize: 0 }, 'householdSize'],
        ['telefone com mais de 20 caracteres', { phone: '1'.repeat(21) }, 'phone'],
        ['bairro com mais de 80 caracteres', { neighborhood: 'b'.repeat(81) }, 'neighborhood'],
        ['observações com mais de 300 caracteres', { notes: 'n'.repeat(301) }, 'notes'],
    ])('validação: %s → 400 com fieldErrors.%s', async (_name, override, field) => {
        await expectFieldError(
            beneficiaries.createBeneficiary({ ...payload(), ...override }),
            field,
        )
    })

    it('busca por id e 404', async () => {
        check(await beneficiaries.getBeneficiary(family.id), SHAPES.beneficiary, 'família')
        await expectStatus(beneficiaries.getBeneficiary(999999), 404)
    })

    it('atualiza', async () => {
        const responsibleName = unique('Responsável Atualizado')
        const updated = await beneficiaries.updateBeneficiary(family.id, {
            ...payload(),
            responsibleName,
            householdSize: 6,
        })
        family = updated
        expect(updated).toMatchObject({
            id: family.id,
            responsibleName,
            householdSize: 6,
        })
    })

    it('atualizar família inexistente → 404', async () => {
        await expectStatus(beneficiaries.updateBeneficiary(999999, payload()), 404)
    })

    it('inativa e reativa', async () => {
        expect((await beneficiaries.setBeneficiaryStatus(family.id, 'INACTIVE')).status).toBe(
            'INACTIVE',
        )
        expect((await beneficiaries.setBeneficiaryStatus(family.id, 'ACTIVE')).status).toBe(
            'ACTIVE',
        )
    })

    it('filtros: busca pelo nome do responsável e status', async () => {
        const search = await beneficiaries.listBeneficiaries({ search: family.responsibleName })
        expect(search.content.map((entry) => entry.id)).toContain(family.id)

        await beneficiaries.setBeneficiaryStatus(family.id, 'INACTIVE')
        const inactive = await beneficiaries.listBeneficiaries({
            status: 'INACTIVE',
            search: family.responsibleName,
        })
        expect(inactive.content.map((entry) => entry.id)).toEqual([family.id])
        const active = await beneficiaries.listBeneficiaries({
            status: 'ACTIVE',
            search: family.responsibleName,
        })
        expect(active.content).toEqual([])
        await beneficiaries.setBeneficiaryStatus(family.id, 'ACTIVE')
    })

    it('lista paginada e formato', async () => {
        check(
            await beneficiaries.listBeneficiaries(),
            pageOf(SHAPES.beneficiary),
            'lista de famílias',
        )
    })

    it('resumo de entregas e histórico de família sem movimento', async () => {
        const fresh = await beneficiaries.createBeneficiary(payload())
        const { getDeliverySummary, getFamilyHistory } =
            await import('@/services/requestService.js')
        const summary = await getDeliverySummary(fresh.id)
        check(summary, SHAPES.deliverySummary, 'resumo')
        expect(summary.lastDelivery).toBeNull()
        expect(summary.recentDeliveries).toEqual([])
        const history = await getFamilyHistory(fresh.id)
        check(history, SHAPES.familyHistory, 'histórico')
        expect(history).toEqual({ requests: [], deliveries: [] })
    })

    it('resumo e histórico de família inexistente → 404', async () => {
        const { getDeliverySummary, getFamilyHistory } =
            await import('@/services/requestService.js')
        await expectStatus(getDeliverySummary(999999), 404)
        await expectStatus(getFamilyHistory(999999), 404)
    })
})
