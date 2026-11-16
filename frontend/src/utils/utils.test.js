import { describe, expect, it } from 'vitest'
import { PAGINATION_DOTS } from '@/constants/pagination.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { toCsv } from './csv.js'
import { createLineKey, removeLine, updateLine } from './lines.js'
import { getPaginationRange } from './paginationRange.js'
import { parseQuantity, validateQuantity } from './quantity.js'
import { matchesText } from './search.js'
import { EMAIL_PATTERN, hasErrors, isBlank, isValidPassword } from './validation.js'
import { isEmptyOr, isId, isIsoDate, isOneOf } from './validators.js'

describe('quantity', () => {
    it.each([
        ['2,5', 2.5],
        ['2.5', 2.5],
        [' 10 ', 10],
        [3, 3],
        ['', Number.NaN],
        [null, Number.NaN],
        ['abc', Number.NaN],
    ])('parseQuantity(%j) → %j', (input, expected) => {
        expect(parseQuantity(input)).toEqual(expected)
    })

    it('UNIT aceita só inteiros positivos', () => {
        expect(validateQuantity('3', 'UNIT')).toBe('')
        expect(validateQuantity('1,5', 'UNIT')).toBe(VALIDATION_MESSAGES.quantityInteger)
        expect(validateQuantity('0', 'UNIT')).toBe(VALIDATION_MESSAGES.quantityPositive)
        expect(validateQuantity('-1', 'UNIT')).toBe(VALIDATION_MESSAGES.quantityPositive)
        expect(validateQuantity('', 'UNIT')).toBe(VALIDATION_MESSAGES.quantityRequired)
    })

    it('KG e L aceitam até 3 casas decimais', () => {
        expect(validateQuantity('1,125', 'KG')).toBe('')
        expect(validateQuantity('0,001', 'L')).toBe('')
        expect(validateQuantity('1,1234', 'KG')).toBe(VALIDATION_MESSAGES.quantityDecimals)
    })

    it('allowZero aceita zero mas não negativo', () => {
        expect(validateQuantity('0', 'KG', { allowZero: true })).toBe('')
        expect(validateQuantity('-1', 'KG', { allowZero: true })).toBe(
            VALIDATION_MESSAGES.quantityNotNegative,
        )
    })

    it('tolera imprecisão de ponto flutuante (0,1 + 0,2)', () => {
        expect(validateQuantity(String(0.1 + 0.2), 'KG')).toBe('')
        expect(validateQuantity('0,3', 'KG')).toBe('')
    })
})

describe('validation', () => {
    it('isBlank', () => {
        expect(isBlank('   ')).toBe(true)
        expect(isBlank(null)).toBe(true)
        expect(isBlank(' a ')).toBe(false)
    })

    it('hasErrors enxerga erros aninhados (linhas e aprovados)', () => {
        expect(hasErrors({})).toBe(false)
        expect(hasErrors({ a: undefined, lines: [{}, {}] })).toBe(false)
        expect(hasErrors({ lines: [{}, { itemId: 'x' }] })).toBe(true)
        expect(hasErrors({ approved: { 12: 'erro' } })).toBe(true)
    })

    it('senha entre 8 e 72 caracteres', () => {
        expect(isValidPassword('1234567')).toBe(false)
        expect(isValidPassword('12345678')).toBe(true)
        expect(isValidPassword('x'.repeat(72))).toBe(true)
        expect(isValidPassword('x'.repeat(73))).toBe(false)
    })

    it('e-mail', () => {
        expect(EMAIL_PATTERN.test('a@b.co')).toBe(true)
        expect(EMAIL_PATTERN.test('sem-arroba')).toBe(false)
        expect(EMAIL_PATTERN.test('a b@c.d')).toBe(false)
    })
})

describe('validators (parâmetros de URL)', () => {
    it('isId, isIsoDate, isOneOf, isEmptyOr', () => {
        expect(isId('12')).toBe(true)
        expect(isId('12a')).toBe(false)
        expect(isId('-1')).toBe(false)
        expect(isIsoDate('2026-11-15')).toBe(true)
        expect(isIsoDate('15/11/2026')).toBe(false)
        expect(isOneOf(['A', 'B'])('A')).toBe(true)
        expect(isOneOf(['A', 'B'])('C')).toBe(false)
        expect(isEmptyOr(isId)('')).toBe(true)
        expect(isEmptyOr(isId)('x')).toBe(false)
    })
})

describe('search', () => {
    it('ignora acentos e maiúsculas e procura em vários campos', () => {
        expect(matchesText(['José da Conceição', null], 'jose')).toBe(true)
        expect(matchesText(['Centro', '47999'], 'CENTRO')).toBe(true)
        expect(matchesText(['Maria'], 'joão')).toBe(false)
        expect(matchesText(['qualquer'], '  ')).toBe(true)
    })
})

describe('csv', () => {
    const columns = [
        { header: 'Nome', value: (row) => row.name },
        { header: 'Qtd', value: (row) => row.qty },
    ]

    it('usa ; como separador, CRLF e aspas escapadas', () => {
        expect(toCsv([{ name: 'Arroz "tipo 1"', qty: 2 }], columns)).toBe(
            '"Nome";"Qtd"\r\n"Arroz ""tipo 1""";"2"',
        )
    })

    it('neutraliza fórmulas (=, +, -, @) contra injeção em planilhas', () => {
        const csv = toCsv([{ name: '=HYPERLINK("x")', qty: '-5' }], columns)
        expect(csv).toContain(`"'=HYPERLINK`)
        expect(csv).toContain(`"'-5"`)
    })

    it('valores nulos viram vazio', () => {
        expect(toCsv([{ name: null, qty: undefined }], columns)).toBe('"Nome";"Qtd"\r\n"";""')
    })
})

describe('paginationRange', () => {
    it('poucas páginas: todas', () => {
        expect(getPaginationRange(1, 3)).toEqual([1, 2, 3])
    })

    it('muitas páginas: reticências nas pontas e primeira/última sempre presentes', () => {
        const first = getPaginationRange(1, 20)
        expect(first[0]).toBe(1)
        expect(first.at(-1)).toBe(20)
        expect(first).toContain(PAGINATION_DOTS)

        const middle = getPaginationRange(10, 20)
        expect(middle.filter((item) => item === PAGINATION_DOTS)).toHaveLength(2)
        expect(middle).toContain(10)
    })

    it('última página não perde a vizinhança', () => {
        const last = getPaginationRange(20, 20)
        expect(last.at(-1)).toBe(20)
        expect(last).toContain(19)
    })
})

describe('lines', () => {
    it('chaves únicas e operações imutáveis', () => {
        const first = createLineKey()
        const second = createLineKey()
        expect(first).not.toBe(second)

        const lines = [
            { key: first, itemId: '' },
            { key: second, itemId: '' },
        ]
        const updated = updateLine(lines, first, 'itemId', '7')
        expect(updated[0].itemId).toBe('7')
        expect(lines[0].itemId).toBe('')
        expect(removeLine(lines, first)).toEqual([lines[1]])
    })
})
