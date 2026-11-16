import {
    ADJUSTMENT_REASON_LABELS,
    LISTED_MOVEMENT_TYPES,
    MOVEMENT_TYPES,
} from '@/constants/movementTypes.js'
import { PERMISSIONS } from '@/constants/permissions.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { formatQuantity } from '@/utils/formatters.js'
import { isBlank } from '@/utils/validation.js'
import { addMovement, db } from './mockDb.js'
import { describeEntrySource } from '@/utils/entries.js'
import { simulateRequest } from './mockApi.js'
import {
    badRequest,
    conflict,
    findOrThrow,
    getBeneficiary,
    getItem,
    getUserName,
    isWithinPeriod,
    normalizeText,
    nowIso,
    paginate,
} from './mockHelpers.js'
import { getItemBalance } from './mockStock.js'

const REVERSIBLE_TYPES = [MOVEMENT_TYPES.ENTRY, MOVEMENT_TYPES.DELIVERY, MOVEMENT_TYPES.ADJUSTMENT]

const findEntry = (entryItemId) =>
    db.entries.find((entry) => entry.items.some((entryItem) => entryItem.id === entryItemId))

const findRequest = (requestItemId) =>
    db.requests.find((request) =>
        request.items.some((requestItem) => requestItem.id === requestItemId),
    )

const findReversal = (movementId) =>
    db.movements.find((movement) => movement.reversesId === movementId)

const describeReference = (movement) => {
    if (movement.type === MOVEMENT_TYPES.ENTRY) {
        const entry = findEntry(movement.donationEntryItemId)
        return { label: `Entrada #${entry.id} — ${describeEntrySource(entry)}`, entryId: entry.id }
    }
    if (movement.type === MOVEMENT_TYPES.DELIVERY) {
        const request = findRequest(movement.aidRequestItemId)
        const family = getBeneficiary(request.beneficiaryId)?.responsibleName ?? ''
        return { label: `Solicitação #${request.id} — ${family}`, requestId: request.id }
    }
    if (movement.type === MOVEMENT_TYPES.ADJUSTMENT) {
        return { label: `Ajuste — ${ADJUSTMENT_REASON_LABELS[movement.adjustmentReason]}` }
    }
    return { label: `Estorno do lançamento #${movement.reversesId}` }
}

const toMovementRow = (movement) => {
    const item = getItem(movement.itemId)
    const reversal = findReversal(movement.id)
    return {
        id: movement.id,
        type: movement.type,
        occurredAt: movement.occurredAt,
        itemId: item.id,
        itemName: item.name,
        unitOfMeasure: item.unitOfMeasure,
        quantity: movement.quantity,
        userId: movement.userId,
        userName: getUserName(movement.userId),
        adjustmentReason: movement.adjustmentReason,
        reason: movement.reason,
        reversesId: movement.reversesId,
        reversedById: reversal?.id ?? null,
        reference: describeReference(movement),
    }
}

const matchesFilters = (movement, { from, to, itemId, type, userId }) =>
    LISTED_MOVEMENT_TYPES.includes(movement.type) &&
    isWithinPeriod(movement.occurredAt, { from, to }) &&
    (!itemId || movement.itemId === Number(itemId)) &&
    (!type || movement.type === type) &&
    (!userId || movement.userId === Number(userId))

export const mockListMovements = ({ page = 0, size, ...filters } = {}) =>
    simulateRequest(() =>
        paginate(
            db.movements
                .filter((movement) => matchesFilters(movement, filters))
                .toSorted(
                    (first, second) =>
                        second.occurredAt.localeCompare(first.occurredAt) || second.id - first.id,
                )
                .map(toMovementRow),
            page,
            size,
        ),
    )

export const mockGetMovement = (id) =>
    simulateRequest(() => {
        const movement = findOrThrow(db.movements, id)
        const row = toMovementRow(movement)
        return {
            ...row,
            original: movement.reversesId
                ? toMovementRow(findOrThrow(db.movements, movement.reversesId))
                : null,
            reversal: row.reversedById
                ? toMovementRow(findOrThrow(db.movements, row.reversedById))
                : null,
        }
    })

const ensureReversible = (movement, { justification, itemsReturned }) => {
    if (!REVERSIBLE_TYPES.includes(movement.type)) {
        throw conflict('Somente entradas, entregas e ajustes podem ser estornados.')
    }
    if (findReversal(movement.id)) throw conflict('Este lançamento já foi estornado.')
    if (isBlank(justification)) {
        throw badRequest('Revise os campos destacados.', {
            justification: VALIDATION_MESSAGES.justificationRequired,
        })
    }
    if (movement.type === MOVEMENT_TYPES.DELIVERY && !itemsReturned) {
        throw badRequest('Revise os campos destacados.', {
            itemsReturned:
                'O estorno de entrega devolve os itens ao estoque. Confirme que eles retornaram à instituição.',
        })
    }
    if (movement.type === MOVEMENT_TYPES.ENTRY) {
        const item = getItem(movement.itemId)
        const { available } = getItemBalance(item.id)
        if (available < movement.quantity) {
            throw conflict(
                `Saldo disponível insuficiente para estornar: há ${formatQuantity(available, item.unitOfMeasure)} de ${item.name} e a entrada tem ${formatQuantity(movement.quantity, item.unitOfMeasure)}.`,
            )
        }
    }
}

export const mockReverseMovement = (id, payload) =>
    simulateRequest(
        (currentUser) => {
            const movement = findOrThrow(db.movements, id)
            ensureReversible(movement, payload)
            const reversal = addMovement({
                itemId: movement.itemId,
                type: MOVEMENT_TYPES.REVERSAL,
                quantity: movement.quantity,
                userId: currentUser.id,
                occurredAt: nowIso(),
                reversesId: movement.id,
                reason: normalizeText(payload.justification),
            })
            return { id: reversal.id }
        },
        { allowedRoles: PERMISSIONS.REVERSE_MOVEMENT },
    )
