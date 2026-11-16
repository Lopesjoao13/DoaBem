import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { API_MESSAGES } from '@/constants/apiMessages.js'
import { server } from '@/test/server.js'
import { API, signInAs } from '@/test/utils.jsx'
import { loadSession } from './sessionStorageService.js'
import { httpClient } from './httpClient.js'
import { ApiError } from './apiError.js'

const rejection = async (promise) => {
    try {
        await promise
    } catch (error) {
        return error
    }
    throw new Error('A requisição deveria ter falhado.')
}

describe('httpClient', () => {
    describe('requisição', () => {
        it('envia o token da sessão no header Authorization', async () => {
            signInAs()
            let header
            server.use(
                http.get(`${API}/ping`, ({ request }) => {
                    header = request.headers.get('authorization')
                    return HttpResponse.json({})
                }),
            )
            await httpClient.get('/ping')
            expect(header).toBe('Bearer test-token')
        })

        it('não envia Authorization sem sessão', async () => {
            let header = 'unset'
            server.use(
                http.get(`${API}/ping`, ({ request }) => {
                    header = request.headers.get('authorization')
                    return HttpResponse.json({})
                }),
            )
            await httpClient.get('/ping')
            expect(header).toBeNull()
        })

        it('remove parâmetros vazios, nulos e indefinidos da query', async () => {
            let search
            server.use(
                http.get(`${API}/items`, ({ request }) => {
                    search = new URL(request.url).search
                    return HttpResponse.json({})
                }),
            )
            await httpClient.get('/items', {
                status: 'ACTIVE',
                search: '',
                categoryId: null,
                x: undefined,
                page: 0,
            })
            expect(search).toBe('?status=ACTIVE&page=0')
        })

        it.each([
            ['post', 'POST'],
            ['put', 'PUT'],
            ['patch', 'PATCH'],
        ])('%s envia o corpo JSON com o método %s', async (fn, method) => {
            let received
            server.use(
                http.all(`${API}/things/1`, async ({ request }) => {
                    received = { method: request.method, body: await request.json() }
                    return HttpResponse.json({ ok: true })
                }),
            )
            await httpClient[fn]('/things/1', { name: 'x' })
            expect(received).toEqual({ method, body: { name: 'x' } })
        })

        it('devolve o corpo da resposta, não o objeto do axios', async () => {
            server.use(http.get(`${API}/ping`, () => HttpResponse.json({ ok: 1 })))
            await expect(httpClient.get('/ping')).resolves.toEqual({ ok: 1 })
        })

        it('aceita resposta sem corpo (204)', async () => {
            server.use(http.patch(`${API}/x/1`, () => new HttpResponse(null, { status: 204 })))
            await expect(httpClient.patch('/x/1', {})).resolves.toBeFalsy()
        })
    })

    describe('paginação do Spring', () => {
        const springPage = {
            content: [{ id: 1 }, { id: 2 }],
            page: { size: 10, number: 3, totalElements: 42, totalPages: 5 },
        }

        it('achata page{} para o formato usado pelas telas', async () => {
            server.use(http.get(`${API}/list`, () => HttpResponse.json(springPage)))
            await expect(httpClient.get('/list')).resolves.toEqual({
                content: [{ id: 1 }, { id: 2 }],
                page: 3,
                size: 10,
                totalElements: 42,
                totalPages: 5,
            })
        })

        it('preserva campos extras da resposta (ex.: counts das solicitações)', async () => {
            const counts = { PENDING: 1, ALL: 1 }
            server.use(http.get(`${API}/list`, () => HttpResponse.json({ ...springPage, counts })))
            const result = await httpClient.get('/list')
            expect(result.counts).toEqual(counts)
            expect(result.totalPages).toBe(5)
        })

        it('não altera respostas que já estão achatadas (page numérico)', async () => {
            const flat = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }
            server.use(http.get(`${API}/list`, () => HttpResponse.json(flat)))
            await expect(httpClient.get('/list')).resolves.toEqual(flat)
        })

        it('não altera listas simples (ex.: /stock) nem objetos comuns', async () => {
            server.use(
                http.get(`${API}/stock`, () => HttpResponse.json([{ itemId: 1 }])),
                http.get(`${API}/obj`, () => HttpResponse.json({ content: 'texto', page: null })),
            )
            await expect(httpClient.get('/stock')).resolves.toEqual([{ itemId: 1 }])
            await expect(httpClient.get('/obj')).resolves.toEqual({ content: 'texto', page: null })
        })
    })

    describe('erros', () => {
        const fail = (status, body) =>
            server.use(http.get(`${API}/boom`, () => HttpResponse.json(body, { status })))

        it('usa a mensagem do backend', async () => {
            fail(409, { status: 409, message: 'Categoria já existe.' })
            const error = await rejection(httpClient.get('/boom'))
            expect(error).toBeInstanceOf(ApiError)
            expect(error).toMatchObject({
                status: 409,
                message: 'Categoria já existe.',
                fieldErrors: null,
            })
        })

        it.each([
            [403, API_MESSAGES.forbidden],
            [404, API_MESSAGES.notFound],
            [500, API_MESSAGES.unexpected],
        ])('status %i sem mensagem usa o texto padrão', async (status, message) => {
            fail(status, {})
            const error = await rejection(httpClient.get('/boom'))
            expect(error).toMatchObject({ status, message })
        })

        it('erro de rede vira ApiError com status 0', async () => {
            server.use(http.get(`${API}/boom`, () => HttpResponse.error()))
            const error = await rejection(httpClient.get('/boom'))
            expect(error).toMatchObject({ status: 0, message: API_MESSAGES.network })
        })

        it('401 com sessão limpa a sessão e redireciona para o login', async () => {
            signInAs()
            const assign = vi.fn()
            vi.stubGlobal('location', { ...window.location, assign })
            fail(401, { status: 401, message: 'Token inválido' })
            const error = await rejection(httpClient.get('/boom'))
            expect(error.status).toBe(401)
            expect(loadSession()).toBeNull()
            expect(assign).toHaveBeenCalledWith('/login')
            vi.unstubAllGlobals()
        })

        it('401 sem sessão (login errado) não redireciona', async () => {
            const assign = vi.fn()
            vi.stubGlobal('location', { ...window.location, assign })
            fail(401, { status: 401, message: 'E-mail ou senha inválidos.' })
            const error = await rejection(httpClient.get('/boom'))
            expect(error.message).toBe('E-mail ou senha inválidos.')
            expect(assign).not.toHaveBeenCalled()
            vi.unstubAllGlobals()
        })
    })

    describe('fieldErrors', () => {
        const failWith = async (fieldErrors) => {
            server.use(
                http.post(`${API}/boom`, () =>
                    HttpResponse.json(
                        { status: 400, message: 'Revise os campos destacados.', fieldErrors },
                        { status: 400 },
                    ),
                ),
            )
            return rejection(httpClient.post('/boom', {}))
        }

        it('mantém campos simples', async () => {
            const error = await failWith({ name: 'Informe o nome.', justification: 'Obrigatória' })
            expect(error.fieldErrors).toEqual({
                name: 'Informe o nome.',
                justification: 'Obrigatória',
            })
        })

        it('aninha lines[n].campo em arrays de objetos', async () => {
            const error = await failWith({
                'lines[0].itemId': 'Escolha um item ativo.',
                'lines[2].requestedQty': 'Itens em UNIT aceitam inteiros.',
                'lines[0].requestedQty': 'Maior que zero.',
            })
            expect(error.fieldErrors.lines[0]).toEqual({
                itemId: 'Escolha um item ativo.',
                requestedQty: 'Maior que zero.',
            })
            expect(error.fieldErrors.lines[1]).toBeUndefined()
            expect(error.fieldErrors.lines[2]).toEqual({
                requestedQty: 'Itens em UNIT aceitam inteiros.',
            })
        })

        it('aninha approved.<id> em objeto indexado pelo id da linha', async () => {
            const error = await failWith({
                'approved.12': 'O aprovado não pode exceder o solicitado.',
                justification: 'Informe a justificativa da aprovação parcial.',
            })
            expect(error.fieldErrors.approved).toEqual({
                12: 'O aprovado não pode exceder o solicitado.',
            })
            expect(error.fieldErrors.justification).toMatch(/justificativa/)
        })

        it('mistura chaves planas e aninhadas', async () => {
            const error = await failWith({
                beneficiaryId: 'Famílias ativas.',
                'lines[0].itemId': 'Duplicado.',
            })
            expect(error.fieldErrors).toEqual({
                beneficiaryId: 'Famílias ativas.',
                lines: [{ itemId: 'Duplicado.' }],
            })
        })

        it('fieldErrors ausente fica null', async () => {
            server.use(
                http.post(`${API}/boom`, () =>
                    HttpResponse.json({ status: 409, message: 'x' }, { status: 409 }),
                ),
            )
            const error = await rejection(httpClient.post('/boom', {}))
            expect(error.fieldErrors).toBeNull()
        })
    })
})
