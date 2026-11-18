import { beforeAll, describe, expect, it } from 'vitest'
import { SHAPES } from '@/test/shapes.js'
import { httpClient } from '@/services/httpClient.js'
import * as auth from '@/services/authService.js'
import { saveSession } from '@/services/sessionStorageService.js'
import * as users from '@/services/userService.js'
import * as catalog from '@/services/catalogService.js'
import * as stock from '@/services/stockService.js'
import {
    COORDINATOR,
    OPERATOR,
    check,
    expectStatus,
    isBackendUp,
    signInAs,
    signOut,
    unique,
} from './helpers.js'

const up = await isBackendUp()

describe.skipIf(!up)('autenticação e autorização', () => {
    beforeAll(signOut)

    describe('login', () => {
        it('coordenador entra e a sessão tem token, nome e perfil', async () => {
            const session = await auth.login(COORDINATOR.email, COORDINATOR.password)
            expect(session.token).toMatch(/^eyJ/)
            expect(session.user).toEqual({
                name: expect.any(String),
                email: COORDINATOR.email,
                role: 'COORDINATOR',
            })
            expect(session.expiresAt).toBeGreaterThan(Date.now())
        })

        it('resposta crua do login segue o contrato', async () => {
            const raw = await httpClient.post('/auth/login', COORDINATOR)
            check(raw, SHAPES.session, 'login')
            expect(raw.tokenType).toBe('Bearer')
            expect(raw.expiresIn).toBeGreaterThan(0)
        })

        it('operador entra com perfil OPERATOR', async () => {
            const session = await auth.login(OPERATOR.email, OPERATOR.password)
            expect(session.user.role).toBe('OPERATOR')
        })

        it('e-mail é normalizado (maiúsculas e espaços)', async () => {
            const session = await auth.login(
                `  ${COORDINATOR.email.toUpperCase()} `,
                COORDINATOR.password,
            )
            expect(session.user.email).toBe(COORDINATOR.email)
        })

        it('senha errada → 401', async () => {
            await expectStatus(auth.login(COORDINATOR.email, 'errada123'), 401)
        })

        it('usuário inexistente → 401 (mesma resposta da senha errada)', async () => {
            const wrongPassword = await expectStatus(
                auth.login(COORDINATOR.email, 'errada123'),
                401,
            )
            const unknown = await expectStatus(
                auth.login('naoexiste@doabem.local', 'qualquer123'),
                401,
            )
            expect(unknown.message).toBe(wrongPassword.message)
        })

        it('corpo vazio → 400 com fieldErrors', async () => {
            const error = await expectStatus(httpClient.post('/auth/login', {}), 400)
            expect(error.fieldErrors).toBeTruthy()
        })
    })

    describe('sessão', () => {
        it('GET /auth/me devolve e-mail e perfil do token', async () => {
            await signInAs(OPERATOR)
            const me = await auth.getCurrentUser()
            expect(me).toEqual({ email: OPERATOR.email, role: 'OPERATOR' })
        })

        it('rota protegida sem token → 401', async () => {
            signOut()
            await expectStatus(stock.getStock(), 401)
        })

        it('token inválido → 401', async () => {
            saveSession({
                token: 'lixo.lixo.lixo',
                expiresAt: Date.now() + 60_000,
                user: { role: 'OPERATOR' },
            })
            await expectStatus(stock.getStock(), 401)
        })
    })

    describe('permissões do operador (rotas só de coordenador)', () => {
        beforeAll(async () => {
            await signInAs(OPERATOR)
        })

        it('operador lê catálogo e estoque', async () => {
            await expect(catalog.listCategories()).resolves.toBeTruthy()
            await expect(catalog.listItems()).resolves.toBeTruthy()
            await expect(stock.getStock()).resolves.toBeTruthy()
        })

        it('operador acessa as opções de usuário (filtros)', async () => {
            const options = await users.listUserOptions()
            expect(options.length).toBeGreaterThan(0)
        })

        it.each([
            ['listar usuários', () => users.listUsers()],
            ['ver usuário', () => users.getUser(1)],
            [
                'criar usuário',
                () =>
                    users.createUser({
                        name: 'X',
                        email: `${unique('x').replace(/\s/g, '')}@a.b`,
                        password: '12345678',
                        role: 'OPERATOR',
                    }),
            ],
            [
                'editar usuário',
                () => users.updateUser(1, { name: 'X', email: 'x@a.b', role: 'OPERATOR' }),
            ],
            ['mudar situação de usuário', () => users.setUserActive(1, false)],
            ['criar categoria', () => catalog.createCategory({ name: unique('Cat') })],
            ['editar categoria', () => catalog.updateCategory(1, { name: unique('Cat') })],
            ['mudar situação de categoria', () => catalog.setCategoryActive(1, false)],
            [
                'criar item',
                () =>
                    catalog.createItem({
                        categoryId: 1,
                        name: unique('Item'),
                        unitOfMeasure: 'UNIT',
                    }),
            ],
            [
                'editar item',
                () => catalog.updateItem(1, { categoryId: 1, name: unique('Item'), minStock: 1 }),
            ],
            ['mudar situação de item', () => catalog.setItemStatus(1, 'INACTIVE')],
            [
                'ajustar estoque',
                () =>
                    stock.createAdjustment({
                        itemId: 1,
                        quantity: 1,
                        adjustmentReason: 'LOSS',
                        notes: 'x',
                    }),
            ],
        ])('operador não pode %s → 403', async (_name, call) => {
            await expectStatus(call(), 403)
        })
    })
})
