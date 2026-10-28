import { MOVEMENT_TYPES } from '@/constants/movementTypes.js'
import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { validateQuantity } from '@/utils/quantity.js'
import { addMovement, db, nextId } from './mockDb.js'
import { simulateRequest } from './mockApi.js'
import {
    badRequest,
    findOrThrow,
    getItem,
    getUserName,
    normalizeText,
    nowIso,
    paginate,
    todayIso,
} from './mockHelpers.js'

const toEntrySummary = (entry) => ({
    id: entry.id,
    entryDate: entry.entryDate,
    source: entry.source,
    anonymous: entry.anonymous,
    registeredBy: getUserName(entry.userId),
    createdAt: entry.createdAt,
})

const toEntryItemResponse = (entryItem) => {
    const item = getItem(entryItem.itemId)
    return {
        id: entryItem.id,
        itemId: item.id,
        itemName: item.name,
        unitOfMeasure: item.unitOfMeasure,
        quantity: entryItem.quantity,
        expiryDate: entryItem.expiryDate,
    }
}

const toEntryResponse = (entry) => ({
    ...toEntrySummary(entry),
    notes: entry.notes,
    items: entry.items.map(toEntryItemResponse),
})

const byNewest = (first, second) =>
    second.entryDate.localeCompare(first.entryDate) || second.id - first.id

export const mockListEntries = ({ page, size } = {}) =>
    simulateRequest(() => paginate(db.entries.toSorted(byNewest).map(toEntrySummary), page, size))

export const mockGetEntry = (id) =>
    simulateRequest(() => toEntryResponse(findOrThrow(db.entries, id)))

const validateLine = (line, seenItemIds) => {
    const errors = {}
    const item = getItem(line.itemId)

    if (!item) errors.itemId = VALIDATION_MESSAGES.required
    else if (item.status !== RECORD_STATUS.ACTIVE)
        errors.itemId = 'Item inativo não recebe entradas.'
    else if (seenItemIds.has(item.id)) errors.itemId = VALIDATION_MESSAGES.duplicatedItem

    if (item) {
        const quantityError = validateQuantity(line.quantity, item.unitOfMeasure)
        if (quantityError) errors.quantity = quantityError
        seenItemIds.add(item.id)
    }

    return errors
}

const validateEntry = ({ entryDate, items }) => {
    const fieldErrors = {}
    if (entryDate > todayIso()) fieldErrors.entryDate = VALIDATION_MESSAGES.futureDate
    if (!items?.length) fieldErrors.linesEmpty = VALIDATION_MESSAGES.linesRequired

    const seenItemIds = new Set()
    const lineErrors = (items ?? []).map((line) => validateLine(line, seenItemIds))
    if (lineErrors.some((errors) => Object.keys(errors).length > 0)) fieldErrors.lines = lineErrors

    if (Object.keys(fieldErrors).length > 0) {
        throw badRequest('Nenhuma linha foi gravada. Revise os itens destacados.', fieldErrors)
    }
}

export const mockCreateEntry = (payload) =>
    simulateRequest((currentUser) => {
        validateEntry(payload)

        const createdAt = nowIso()
        const entry = {
            id: nextId('entries'),
            userId: currentUser.id,
            entryDate: payload.entryDate || todayIso(),
            source: payload.anonymous ? null : normalizeText(payload.source) || null,
            anonymous: Boolean(payload.anonymous),
            notes: normalizeText(payload.notes) || null,
            createdAt,
            items: payload.items.map((line) => ({
                id: nextId('entryItems'),
                itemId: Number(line.itemId),
                quantity: line.quantity,
                expiryDate: line.expiryDate || null,
            })),
        }

        entry.items.forEach((entryItem) => {
            addMovement({
                itemId: entryItem.itemId,
                type: MOVEMENT_TYPES.ENTRY,
                quantity: entryItem.quantity,
                userId: currentUser.id,
                occurredAt: createdAt,
                donationEntryItemId: entryItem.id,
            })
        })

        db.entries.push(entry)
        return toEntryResponse(entry)
    })
