import { UNIT_DECIMALS } from '@/constants/units.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'

const FLOAT_TOLERANCE = 1e-9

export const parseQuantity = (value) => {
    if (typeof value === 'number') return value
    const normalized = String(value ?? '')
        .trim()
        .replace(',', '.')
    return normalized === '' ? Number.NaN : Number(normalized)
}

const hasValidDecimals = (quantity, decimals) => {
    const scaled = quantity * 10 ** decimals
    return Math.abs(scaled - Math.round(scaled)) < FLOAT_TOLERANCE
}

export const validateQuantity = (value, unit, { allowZero = false } = {}) => {
    const quantity = parseQuantity(value)

    if (Number.isNaN(quantity)) return VALIDATION_MESSAGES.quantityRequired
    if (allowZero && quantity < 0) return VALIDATION_MESSAGES.quantityNotNegative
    if (!allowZero && quantity <= 0) return VALIDATION_MESSAGES.quantityPositive

    const decimals = UNIT_DECIMALS[unit]
    if (hasValidDecimals(quantity, decimals)) return ''
    return decimals === 0
        ? VALIDATION_MESSAGES.quantityInteger
        : VALIDATION_MESSAGES.quantityDecimals
}

export const getQuantityStep = (unit) => (UNIT_DECIMALS[unit] === 0 ? '1' : '0.001')
