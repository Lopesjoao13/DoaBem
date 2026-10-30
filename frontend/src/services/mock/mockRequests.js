import { MOVEMENT_TYPES } from '@/constants/movementTypes.js'
import { PERMISSIONS } from '@/constants/permissions.js'
import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { REQUEST_DECISIONS } from '@/constants/requestActions.js'
import { ALL_REQUESTS_TAB, REQUEST_STATUS } from '@/constants/requestStatus.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { formatQuantity } from '@/utils/formatters.js'
import { canAccess } from '@/utils/permissions.js'
import { parseQuantity, validateQuantity } from '@/utils/quantity.js'
import { isBlank } from '@/utils/validation.js'
import { addMovement, db, nextId } from './mockDb.js'
import { simulateRequest } from './mockApi.js'
import { buildDeliverySummary } from './mockDeliveries.js'
import {
    badRequest,
    conflict,
    findOrThrow,
    forbidden,
    getBeneficiary,
    getItem,
    getUserName,
    normalizeText,
    nowIso,
} from './mockHelpers.js'
import { getBalances } from './mockStock.js'

const FIELD_ERROR_MESSAGE = 'Revise os campos destacados.'
const CANCELLABLE_STATUSES = [
    REQUEST_STATUS.PENDING,
    REQUEST_STATUS.APPROVED,
    REQUEST_STATUS.PICKED,
]

const ensureStatus = (request, expected, message) => {
    if (request.status !== expected) throw conflict(message)
}

const toRequestRow = (request) => ({
    id: request.id,
    status: request.status,
    createdAt: request.createdAt,
    beneficiaryId: request.beneficiaryId,
    beneficiaryName: getBeneficiary(request.beneficiaryId)?.responsibleName ?? '',
    requestedBy: getUserName(request.requestedById),
    itemCount: request.items.length,
})

const countByStatus = () =>
    db.requests.reduce(
        (counts, request) => ({ ...counts, [request.status]: (counts[request.status] ?? 0) + 1 }),
        { [ALL_REQUESTS_TAB]: db.requests.length },
    )

export const mockListRequests = ({ status } = {}) =>
    simulateRequest(() => ({
        content: db.requests
            .filter((request) => !status || request.status === status)
            .map(toRequestRow)
            .sort((first, second) => second.createdAt.localeCompare(first.createdAt)),
        counts: countByStatus(),
    }))

const toRequestItemDetail = (requestItem, balances) => {
    const item = getItem(requestItem.itemId)
    return {
        ...requestItem,
        itemName: item.name,
        unitOfMeasure: item.unitOfMeasure,
        itemStatus: item.status,
        available: balances.get(item.id)?.available ?? 0,
    }
}

const buildDelivery = (request) => {
    const delivery = db.deliveries.find((entry) => entry.aidRequestId === request.id)
    if (!delivery) return null
    return {
        id: delivery.id,
        deliveredAt: delivery.deliveredAt,
        deliveredBy: getUserName(delivery.deliveredById),
        notes: delivery.notes,
    }
}

export const mockGetRequest = (id) =>
    simulateRequest(() => {
        const request = findOrThrow(db.requests, id)
        const balances = getBalances()
        const beneficiary = getBeneficiary(request.beneficiaryId)

        return {
            ...toRequestRow(request),
            beneficiary: {
                id: beneficiary.id,
                responsibleName: beneficiary.responsibleName,
                householdSize: beneficiary.householdSize,
                neighborhood: beneficiary.neighborhood,
                phone: beneficiary.phone,
                status: beneficiary.status,
            },
            items: request.items.map((requestItem) => toRequestItemDetail(requestItem, balances)),
            decidedBy: getUserName(request.decidedById),
            decidedAt: request.decidedAt,
            justification: request.justification,
            pickedBy: getUserName(request.pickedById),
            pickedAt: request.pickedAt,
            cancelledBy: getUserName(request.cancelledById),
            cancelledAt: request.cancelledAt,
            cancellationReason: request.cancellationReason,
            delivery: buildDelivery(request),
            familyHistory: buildDeliverySummary(request.beneficiaryId, {
                excludeRequestId: request.id,
            }),
        }
    })

const validateRequestLines = (lines) => {
    const seenItemIds = new Set()
    return lines.map((line) => {
        const errors = {}
        const item = getItem(line.itemId)
        if (!item) errors.itemId = VALIDATION_MESSAGES.required
        else if (item.status !== RECORD_STATUS.ACTIVE) errors.itemId = 'Escolha um item ativo.'
        else if (seenItemIds.has(item.id)) errors.itemId = VALIDATION_MESSAGES.duplicatedItem

        if (item) {
            const quantityError = validateQuantity(line.requestedQty, item.unitOfMeasure)
            if (quantityError) errors.requestedQty = quantityError
            seenItemIds.add(item.id)
        }
        return errors
    })
}

const validateNewRequest = ({ beneficiaryId, lines }) => {
    const fieldErrors = {}
    const beneficiary = getBeneficiary(beneficiaryId)
    if (!beneficiary) fieldErrors.beneficiaryId = VALIDATION_MESSAGES.required
    else if (beneficiary.status !== RECORD_STATUS.ACTIVE) {
        fieldErrors.beneficiaryId = 'Somente famílias ativas recebem novas solicitações.'
    }
    if (!lines?.length) fieldErrors.linesEmpty = VALIDATION_MESSAGES.linesRequired

    const lineErrors = validateRequestLines(lines ?? [])
    if (lineErrors.some((errors) => Object.keys(errors).length > 0)) fieldErrors.lines = lineErrors
    if (Object.keys(fieldErrors).length > 0) throw badRequest(FIELD_ERROR_MESSAGE, fieldErrors)
}

export const mockCreateRequest = (payload) =>
    simulateRequest((currentUser) => {
        validateNewRequest(payload)
        const request = {
            id: nextId('requests'),
            beneficiaryId: Number(payload.beneficiaryId),
            requestedById: currentUser.id,
            status: REQUEST_STATUS.PENDING,
            createdAt: nowIso(),
            decidedById: null,
            decidedAt: null,
            justification: '',
            pickedById: null,
            pickedAt: null,
            cancelledById: null,
            cancelledAt: null,
            cancellationReason: '',
            items: payload.lines.map((line) => ({
                id: nextId('requestItems'),
                itemId: Number(line.itemId),
                requestedQty: parseQuantity(line.requestedQty),
                approvedQty: null,
            })),
        }
        db.requests.push(request)
        return { id: request.id }
    })

const resolveApprovedQuantities = (request, approvedItems) => {
    const lineErrors = {}
    const quantities = request.items.map((requestItem) => {
        const item = getItem(requestItem.itemId)
        const value = approvedItems.find((entry) => entry.id === requestItem.id)?.approvedQty
        const error = validateQuantity(value, item.unitOfMeasure, { allowZero: true })
        const approvedQty = parseQuantity(value)
        if (error) lineErrors[requestItem.id] = error
        else if (approvedQty > requestItem.requestedQty) {
            lineErrors[requestItem.id] = 'O aprovado não pode exceder o solicitado.'
        }
        return approvedQty
    })

    if (Object.keys(lineErrors).length > 0)
        throw badRequest(FIELD_ERROR_MESSAGE, { approved: lineErrors })
    return quantities
}

const recordDecision = (request, currentUser, status, justification) => {
    Object.assign(request, {
        status,
        decidedById: currentUser.id,
        decidedAt: nowIso(),
        justification: normalizeText(justification),
    })
    return { id: request.id, status }
}

export const mockDecideRequest = (id, { decision, items, justification }) =>
    simulateRequest(
        (currentUser) => {
            const request = findOrThrow(db.requests, id)
            ensureStatus(
                request,
                REQUEST_STATUS.PENDING,
                'Somente solicitações pendentes podem ser analisadas.',
            )

            if (decision === REQUEST_DECISIONS.REJECT) {
                if (isBlank(justification)) {
                    throw badRequest(FIELD_ERROR_MESSAGE, {
                        justification: VALIDATION_MESSAGES.justificationRequired,
                    })
                }
                request.items.forEach((requestItem) =>
                    Object.assign(requestItem, { approvedQty: 0 }),
                )
                return recordDecision(request, currentUser, REQUEST_STATUS.REJECTED, justification)
            }

            const quantities = resolveApprovedQuantities(request, items ?? [])
            const hasCut = quantities.some(
                (quantity, index) => quantity < request.items[index].requestedQty,
            )
            if (hasCut && isBlank(justification)) {
                throw badRequest(FIELD_ERROR_MESSAGE, {
                    justification: 'Informe a justificativa da aprovação parcial.',
                })
            }

            request.items.forEach((requestItem, index) => {
                requestItem.approvedQty = quantities[index]
            })
            const allZero = quantities.every((quantity) => quantity === 0)
            const status = allZero ? REQUEST_STATUS.REJECTED : REQUEST_STATUS.APPROVED
            return recordDecision(request, currentUser, status, justification)
        },
        { allowedRoles: PERMISSIONS.DECIDE_REQUEST },
    )

const approvedItemsOf = (request) =>
    request.items.filter((requestItem) => requestItem.approvedQty > 0)

const describeShortages = (request) => {
    const balances = getBalances()
    return approvedItemsOf(request)
        .map((requestItem) => {
            const item = getItem(requestItem.itemId)
            const available = balances.get(item.id)?.available ?? 0
            if (requestItem.approvedQty <= available) return null
            return `${item.name}: aprovado ${formatQuantity(requestItem.approvedQty, item.unitOfMeasure)}, disponível ${formatQuantity(available, item.unitOfMeasure)}`
        })
        .filter(Boolean)
}

export const mockPickRequest = (id) =>
    simulateRequest((currentUser) => {
        const request = findOrThrow(db.requests, id)
        ensureStatus(
            request,
            REQUEST_STATUS.APPROVED,
            'Somente solicitações aprovadas podem ser separadas.',
        )

        const inactive = approvedItemsOf(request).find(
            (requestItem) => getItem(requestItem.itemId).status !== RECORD_STATUS.ACTIVE,
        )
        if (inactive)
            throw conflict(`${getItem(inactive.itemId).name} está inativo. Revise a solicitação.`)

        const shortages = describeShortages(request)
        if (shortages.length > 0) {
            throw conflict(
                `Saldo insuficiente para separar. ${shortages.join('; ')}. Nenhuma reserva foi feita: revise a solicitação ou cancele e crie outra.`,
            )
        }

        const pickedAt = nowIso()
        approvedItemsOf(request).forEach((requestItem) => {
            addMovement({
                itemId: requestItem.itemId,
                type: MOVEMENT_TYPES.RESERVE,
                quantity: requestItem.approvedQty,
                userId: currentUser.id,
                occurredAt: pickedAt,
                aidRequestItemId: requestItem.id,
            })
        })
        Object.assign(request, {
            status: REQUEST_STATUS.PICKED,
            pickedById: currentUser.id,
            pickedAt,
        })
        return { id: request.id, status: request.status }
    })

export const mockDeliverRequest = (id, { notes }) =>
    simulateRequest((currentUser) => {
        const request = findOrThrow(db.requests, id)
        ensureStatus(
            request,
            REQUEST_STATUS.PICKED,
            'Somente solicitações separadas podem ser entregues.',
        )

        const deliveredAt = nowIso()
        const delivery = {
            id: nextId('deliveries'),
            aidRequestId: request.id,
            deliveredById: currentUser.id,
            deliveredAt,
            notes: normalizeText(notes),
            items: approvedItemsOf(request).map((requestItem) => ({
                id: nextId('deliveryItems'),
                aidRequestItemId: requestItem.id,
                deliveredQty: requestItem.approvedQty,
            })),
        }

        delivery.items.forEach((deliveryItem) => {
            const requestItem = request.items.find(
                (entry) => entry.id === deliveryItem.aidRequestItemId,
            )
            const shared = {
                itemId: requestItem.itemId,
                quantity: deliveryItem.deliveredQty,
                userId: currentUser.id,
                occurredAt: deliveredAt,
                aidRequestItemId: requestItem.id,
                deliveryItemId: deliveryItem.id,
            }
            addMovement({ ...shared, type: MOVEMENT_TYPES.DELIVERY })
            addMovement({ ...shared, type: MOVEMENT_TYPES.RELEASE })
        })

        db.deliveries.push(delivery)
        request.status = REQUEST_STATUS.DELIVERED
        return { id: request.id, status: request.status }
    })

const ensureCanCancel = (request, currentUser) => {
    if (!CANCELLABLE_STATUSES.includes(request.status)) {
        throw conflict('Esta solicitação não pode mais ser cancelada.')
    }
    const permission =
        request.status === REQUEST_STATUS.PICKED
            ? PERMISSIONS.CANCEL_PICKED_REQUEST
            : PERMISSIONS.CANCEL_OPEN_REQUEST
    if (!canAccess(permission, currentUser.role)) throw forbidden()
}

export const mockCancelRequest = (id, { reason }) =>
    simulateRequest((currentUser) => {
        const request = findOrThrow(db.requests, id)
        ensureCanCancel(request, currentUser)
        if (isBlank(reason))
            throw badRequest(FIELD_ERROR_MESSAGE, { reason: VALIDATION_MESSAGES.reasonRequired })

        const cancelledAt = nowIso()
        if (request.status === REQUEST_STATUS.PICKED) {
            approvedItemsOf(request).forEach((requestItem) => {
                addMovement({
                    itemId: requestItem.itemId,
                    type: MOVEMENT_TYPES.RELEASE,
                    quantity: requestItem.approvedQty,
                    userId: currentUser.id,
                    occurredAt: cancelledAt,
                    aidRequestItemId: requestItem.id,
                })
            })
        }

        Object.assign(request, {
            status: REQUEST_STATUS.CANCELLED,
            cancelledById: currentUser.id,
            cancelledAt,
            cancellationReason: normalizeText(reason),
        })
        return { id: request.id, status: request.status }
    })
