import { describe, expect, it } from 'vitest'
import { expectShape, findShapeProblems, oneOf, opt, pageOf } from './shapes.js'

describe('validador de formato (shapes)', () => {
    it('aceita um objeto válido e campos opcionais ausentes ou nulos', () => {
        const schema = { id: 'number', nome: opt('string') }
        expect(findShapeProblems({ id: 1 }, schema)).toEqual([])
        expect(findShapeProblems({ id: 1, nome: null }, schema)).toEqual([])
        expect(findShapeProblems({ id: 1, nome: 'x', extra: true }, schema)).toEqual([])
    })

    it('aponta campo ausente, tipo errado e valor fora do enum', () => {
        const problems = findShapeProblems(
            { id: '1', status: 'X' },
            { id: 'number', status: oneOf('A', 'B'), nome: 'string' },
        )
        expect(problems).toHaveLength(3)
        expect(problems.join('\n')).toMatch(/\$\.id: esperado number/)
        expect(problems.join('\n')).toMatch(/\$\.status: esperado um de A, B/)
        expect(problems.join('\n')).toMatch(/\$\.nome: campo ausente/)
    })

    it('valida arrays e indica o índice com problema', () => {
        const problems = findShapeProblems(
            { content: [{ id: 1 }, { id: 'x' }] },
            { content: [{ id: 'number' }] },
        )
        expect(problems).toEqual(['$.content[1].id: esperado number, veio string ("x")'])
    })

    it('rejeita null e array onde se espera objeto', () => {
        expect(findShapeProblems(null, { a: 'number' })).toHaveLength(1)
        expect(findShapeProblems([], { a: 'number' })).toHaveLength(1)
    })

    it('rejeita NaN e Infinity como number', () => {
        expect(findShapeProblems(Number.NaN, 'number')).toHaveLength(1)
        expect(findShapeProblems(Infinity, 'number')).toHaveLength(1)
    })

    it('pageOf exige os campos de paginação achatados', () => {
        expect(
            findShapeProblems({ content: [], page: { number: 0 } }, pageOf({ id: 'number' })),
        ).not.toEqual([])
        expect(
            findShapeProblems(
                { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 },
                pageOf({ id: 'number' }),
            ),
        ).toEqual([])
    })

    it('expectShape lança com a lista de problemas', () => {
        expect(() => expectShape({}, { id: 'number' }, 'usuário')).toThrow(
            /usuário fora do contrato[\s\S]*\$\.id: campo ausente/,
        )
    })
})
