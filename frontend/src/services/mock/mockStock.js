import { ADJUSTMENT_REASONS, MOVEMENT_TYPES } from '@/constants/movementTypes.js'
import { PERMISSIONS } from '@/constants/permissions.js'
import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { formatQuantity } from '@/utils/formatters.js'
import { parseQuantity, validateQuantity } from '@/utils/quantity.js'
import { isBlank } from '@/utils/validation.js'
import { addMovement, db } from './mockDb.js'
import { simulateRequest } from './mockApi.js'
import { badRequest, conflict, findOrThrow, normalizeText, nowIso } from './mockHelpers.js'
import { calculateBalances, getStockLevel } from './stockBalance.js'

const EMPTY_BALANCE = { physical: 0, reserved: 0, available: 0 }

export const getBalances = () => calculateBalances(db.movements)

export const getItemBalance = (itemId) => getBalances().get(Number(itemId)) ?? EMPTY_BALANCE

export const buildStockRows = () => {
    const balances = getBalances()
    const categoriesById = new Map(db.categories.map((category) => [category.id, category]))

    return db.items.map((item) => {
        const balance = balances.get(item.id) ?? EMPTY_BALANCE
        return {
            itemId: item.id,
            name: item.name,
            categoryId: item.categoryId,
            categoryName: categoriesById.get(item.categoryId)?.name ?? '',
            unitOfMeasure: item.unitOfMeasure,
            minStock: item.minStock,
            status: item.status,
            ...balance,
            level: getStockLevel(balance.available, item.minStock),
        }
    })
}

export const mockGetStock = ({ status } = {}) =>
    simulateRequest(() =>
        buildStockRows()
            .filter((row) => !status || row.status === status)
            .sort((first, second) => first.name.localeCompare(second.name)),
    )

const validateAdjustment = ({ itemId, quantity, adjustmentReason, notes }) => {
    const item = findOrThrow(db.items, itemId)
    if (item.status !== RECORD_STATUS.ACTIVE) throw conflict('Item inativo não recebe ajustes.')

    const fieldErrors = {}
    const quantityError = validateQuantity(quantity, item.unitOfMeasure)
    if (quantityError) fieldErrors.quantity = quantityError
    if (!Object.values(ADJUSTMENT_REASONS).includes(adjustmentReason)) {
        fieldErrors.adjustmentReason = VALIDATION_MESSAGES.reasonRequired
    }
    if (isBlank(notes)) fieldErrors.notes = VALIDATION_MESSAGES.required
    if (Object.keys(fieldErrors).length > 0)
        throw badRequest('Revise os campos destacados.', fieldErrors)

    const { available } = getItemBalance(item.id)
    if (parseQuantity(quantity) > available) {
        throw conflict(
            `Saldo disponível insuficiente: há ${formatQuantity(available, item.unitOfMeasure)} de ${item.name}. O estoque não pode ficar negativo.`,
        )
    }
    return item
}

export const mockCreateAdjustment = (payload) =>
    simulateRequest(
        (currentUser) => {
            const item = validateAdjustment(payload)
            return addMovement({
                itemId: item.id,
                type: MOVEMENT_TYPES.ADJUSTMENT,
                quantity: parseQuantity(payload.quantity),
                adjustmentReason: payload.adjustmentReason,
                reason: normalizeText(payload.notes),
                userId: currentUser.id,
                occurredAt: nowIso(),
            })
        },
        { allowedRoles: PERMISSIONS.ADJUST_STOCK },
    )
