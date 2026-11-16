import { MOVEMENT_TYPES } from '@/constants/movementTypes.js'
import { REQUEST_STATUS } from '@/constants/requestStatus.js'
import { loadMockState, saveMockState } from '@/services/sessionStorageService.js'
import {
    SEED_ADJUSTMENTS,
    SEED_BENEFICIARIES,
    SEED_CATEGORIES,
    SEED_ENTRIES,
    SEED_ITEMS,
    SEED_REQUESTS,
    SEED_USERS,
} from './mockSeed.js'

const STATUSES_WITH_RESERVE = [REQUEST_STATUS.PICKED, REQUEST_STATUS.DELIVERED]

const MOVEMENT_DEFAULTS = {
    donationEntryItemId: null,
    aidRequestItemId: null,
    deliveryItemId: null,
    reversesId: null,
    adjustmentReason: null,
    reason: null,
}

export const db = {
    users: structuredClone(SEED_USERS),
    categories: structuredClone(SEED_CATEGORIES),
    items: structuredClone(SEED_ITEMS),
    beneficiaries: structuredClone(SEED_BENEFICIARIES),
    entries: [],
    requests: [],
    deliveries: [],
    movements: [],
}

const lastIds = {
    users: SEED_USERS.length,
    categories: SEED_CATEGORIES.length,
    items: SEED_ITEMS.length,
    beneficiaries: SEED_BENEFICIARIES.length,
    entries: 0,
    entryItems: 0,
    requests: 0,
    requestItems: 0,
    deliveries: 0,
    deliveryItems: 0,
    movements: 0,
}

export const nextId = (sequence) => {
    lastIds[sequence] += 1
    return lastIds[sequence]
}

export const addMovement = (data) => {
    const movement = { ...MOVEMENT_DEFAULTS, id: nextId('movements'), ...data }
    db.movements.push(movement)
    return movement
}

const seedEntry = ({ lines, ...header }) => {
    const createdAt = `${header.entryDate}T10:00:00`
    const entry = {
        ...header,
        id: nextId('entries'),
        createdAt,
        items: lines.map((line) => ({ ...line, id: nextId('entryItems') })),
    }

    entry.items.forEach((entryItem) => {
        addMovement({
            itemId: entryItem.itemId,
            type: MOVEMENT_TYPES.ENTRY,
            quantity: entryItem.quantity,
            userId: entry.userId,
            occurredAt: createdAt,
            donationEntryItemId: entryItem.id,
        })
    })

    db.entries.push(entry)
}

const seedReserves = (request, requestItems) => {
    requestItems.forEach((requestItem) => {
        addMovement({
            itemId: requestItem.itemId,
            type: MOVEMENT_TYPES.RESERVE,
            quantity: requestItem.approvedQty,
            userId: request.pickedById,
            occurredAt: request.pickedAt,
            aidRequestItemId: requestItem.id,
        })
    })
}

const seedDelivery = (request, requestItems, { deliveredById, deliveredAt }) => {
    const delivery = {
        id: nextId('deliveries'),
        aidRequestId: request.id,
        deliveredById,
        deliveredAt,
        notes: '',
        items: requestItems.map((requestItem) => ({
            id: nextId('deliveryItems'),
            aidRequestItemId: requestItem.id,
            deliveredQty: requestItem.approvedQty,
        })),
    }

    delivery.items.forEach((deliveryItem, index) => {
        const requestItem = requestItems[index]
        const shared = {
            itemId: requestItem.itemId,
            quantity: deliveryItem.deliveredQty,
            userId: deliveredById,
            occurredAt: deliveredAt,
            aidRequestItemId: requestItem.id,
            deliveryItemId: deliveryItem.id,
        }
        addMovement({ ...shared, type: MOVEMENT_TYPES.DELIVERY })
        addMovement({ ...shared, type: MOVEMENT_TYPES.RELEASE })
    })

    db.deliveries.push(delivery)
}

const seedRequest = ({ lines, deliveredById, deliveredAt, ...header }) => {
    const request = {
        decidedById: null,
        decidedAt: null,
        justification: '',
        pickedById: null,
        pickedAt: null,
        cancelledById: null,
        cancelledAt: null,
        cancellationReason: '',
        ...header,
        id: nextId('requests'),
        items: lines.map((line) => ({ ...line, id: nextId('requestItems') })),
    }

    const approvedItems = request.items.filter((requestItem) => requestItem.approvedQty > 0)
    if (STATUSES_WITH_RESERVE.includes(request.status)) seedReserves(request, approvedItems)
    if (request.status === REQUEST_STATUS.DELIVERED) {
        seedDelivery(request, approvedItems, { deliveredById, deliveredAt })
    }

    db.requests.push(request)
}

const seedAdjustment = (adjustment) => {
    addMovement({ ...adjustment, type: MOVEMENT_TYPES.ADJUSTMENT })
}

const seedDatabase = () => {
    SEED_ENTRIES.forEach(seedEntry)
    SEED_REQUESTS.forEach(seedRequest)
    SEED_ADJUSTMENTS.forEach(seedAdjustment)
    db.movements.sort((first, second) => first.occurredAt.localeCompare(second.occurredAt))
}

export const persistDb = () => {
    saveMockState({ db, lastIds })
}

const restoredState = loadMockState()
if (restoredState) {
    Object.assign(db, restoredState.db)
    Object.assign(lastIds, restoredState.lastIds)
} else {
    seedDatabase()
    persistDb()
}
