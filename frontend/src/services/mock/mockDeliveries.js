import { RECENT_DELIVERY_DAYS } from '@/constants/families.js'
import { db } from './mockDb.js'
import { simulateRequest } from './mockApi.js'
import { daysAgoIso, findOrThrow, getItem, getUserName } from './mockHelpers.js'

const toDeliveryRow = (delivery) => {
    const request = db.requests.find((entry) => entry.id === delivery.aidRequestId)
    return {
        id: delivery.id,
        requestId: request.id,
        deliveredAt: delivery.deliveredAt,
        deliveredBy: getUserName(delivery.deliveredById),
        items: delivery.items.map((deliveryItem) => {
            const requestItem = request.items.find(
                (entry) => entry.id === deliveryItem.aidRequestItemId,
            )
            const item = getItem(requestItem.itemId)
            return {
                id: deliveryItem.id,
                itemName: item.name,
                unitOfMeasure: item.unitOfMeasure,
                quantity: deliveryItem.deliveredQty,
            }
        }),
    }
}

const listDeliveries = (beneficiaryId) =>
    db.deliveries
        .filter((delivery) =>
            db.requests.some(
                (request) =>
                    request.id === delivery.aidRequestId &&
                    request.beneficiaryId === Number(beneficiaryId),
            ),
        )
        .map(toDeliveryRow)
        .sort((first, second) => second.deliveredAt.localeCompare(first.deliveredAt))

export const buildDeliverySummary = (beneficiaryId, { excludeRequestId } = {}) => {
    const deliveries = listDeliveries(beneficiaryId).filter(
        (delivery) => delivery.requestId !== excludeRequestId,
    )
    const since = daysAgoIso(RECENT_DELIVERY_DAYS)
    return {
        lastDelivery: deliveries[0] ?? null,
        recentDeliveries: deliveries.filter((delivery) => delivery.deliveredAt >= since),
    }
}

const toRequestHistoryRow = (request) => ({
    id: request.id,
    status: request.status,
    createdAt: request.createdAt,
    requestedBy: getUserName(request.requestedById),
    itemCount: request.items.length,
})

export const mockGetDeliverySummary = (beneficiaryId) =>
    simulateRequest(() => buildDeliverySummary(findOrThrow(db.beneficiaries, beneficiaryId).id))

export const mockGetFamilyHistory = (beneficiaryId) =>
    simulateRequest(() => {
        const beneficiary = findOrThrow(db.beneficiaries, beneficiaryId)
        return {
            requests: db.requests
                .filter((request) => request.beneficiaryId === beneficiary.id)
                .map(toRequestHistoryRow)
                .sort((first, second) => second.createdAt.localeCompare(first.createdAt)),
            deliveries: listDeliveries(beneficiary.id),
        }
    })
