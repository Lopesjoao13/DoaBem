import { LISTED_MOVEMENT_TYPES } from '@/constants/movementTypes.js'
import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { REQUEST_STATUS } from '@/constants/requestStatus.js'
import { STOCK_LEVELS } from '@/constants/stockLevels.js'
import { db } from './mockDb.js'
import { simulateRequest } from './mockApi.js'
import { getBeneficiary, isWithinPeriod, nowIso } from './mockHelpers.js'
import { buildStockRows } from './mockStock.js'

const TOP_CRITICAL_LIMIT = 5
const RECENT_MOVEMENTS_LIMIT = 6
const MONTH_LENGTH = 7
const MIN_CHART_MONTHS = 3
const MAX_CHART_MONTHS = 12
const PENDING_LIMIT = 5
const DAY_MS = 24 * 60 * 60 * 1000

const criticalRatio = ({ available, minStock }) => available / Math.max(minStock, 1)

const buildRecentMovements = (stockRows) => {
    const itemsById = new Map(stockRows.map((row) => [row.itemId, row]))
    const usersById = new Map(db.users.map((user) => [user.id, user]))

    return db.movements
        .filter((movement) => LISTED_MOVEMENT_TYPES.includes(movement.type))
        .toSorted((first, second) => second.occurredAt.localeCompare(first.occurredAt))
        .slice(0, RECENT_MOVEMENTS_LIMIT)
        .map((movement) => {
            const item = itemsById.get(movement.itemId)
            return {
                id: movement.id,
                type: movement.type,
                occurredAt: movement.occurredAt,
                itemName: item.name,
                unitOfMeasure: item.unitOfMeasure,
                quantity: movement.quantity,
                userName: usersById.get(movement.userId)?.name ?? '',
            }
        })
}

const toMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

const countMonthsSpanned = (from, to) =>
    (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth() + 1

const listMonthKeys = ({ from, to }) => {
    const end = to ? new Date(`${to}T00:00:00`) : new Date()
    const start = from ? new Date(`${from}T00:00:00`) : end
    const count = Math.min(
        MAX_CHART_MONTHS,
        Math.max(MIN_CHART_MONTHS, countMonthsSpanned(start, end)),
    )
    return Array.from({ length: count }, (_, index) =>
        toMonthKey(new Date(end.getFullYear(), end.getMonth() - (count - 1 - index), 1)),
    )
}

const countByMonth = (dates) =>
    dates.reduce((counts, date) => {
        const month = date.slice(0, MONTH_LENGTH)
        return { ...counts, [month]: (counts[month] ?? 0) + 1 }
    }, {})

const buildMonthly = (period) => {
    const entries = countByMonth(db.entries.map((entry) => entry.entryDate))
    const deliveries = countByMonth(db.deliveries.map((delivery) => delivery.deliveredAt))

    return listMonthKeys(period).map((month) => ({
        month,
        entries: entries[month] ?? 0,
        deliveries: deliveries[month] ?? 0,
    }))
}

const buildBalanceByCategory = (activeRows) =>
    db.categories
        .filter((category) => category.active)
        .map((category) => ({
            categoryId: category.id,
            categoryName: category.name,
            available: activeRows
                .filter((row) => row.categoryId === category.id)
                .reduce((sum, row) => sum + row.available, 0),
        }))
        .sort((first, second) => second.available - first.available)

const previousPeriod = ({ from, to }) => {
    const start = new Date(`${from}T00:00:00`)
    const end = new Date(`${to}T00:00:00`)
    const length = Math.round((end - start) / DAY_MS) + 1
    const toIso = (date) =>
        new Date(date - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
    return {
        from: toIso(new Date(start - length * DAY_MS)),
        to: toIso(new Date(start - DAY_MS)),
    }
}

const countInPeriod = (period) => ({
    entries: db.entries.filter((entry) => isWithinPeriod(entry.entryDate, period)).length,
    deliveries: db.deliveries.filter((delivery) => isWithinPeriod(delivery.deliveredAt, period))
        .length,
})

const buildPendingRequests = () =>
    db.requests
        .filter((request) => request.status === REQUEST_STATUS.PENDING)
        .toSorted((first, second) => first.createdAt.localeCompare(second.createdAt))
        .slice(0, PENDING_LIMIT)
        .map((request) => ({
            id: request.id,
            createdAt: request.createdAt,
            beneficiaryName: getBeneficiary(request.beneficiaryId)?.responsibleName ?? '',
            itemCount: request.items.length,
        }))

const buildSummary = (period) => {
    const stockRows = buildStockRows()
    const activeRows = stockRows.filter((row) => row.status === RECORD_STATUS.ACTIVE)
    const criticalRows = activeRows.filter((row) => row.level === STOCK_LEVELS.CRITICAL)

    return {
        activeItems: activeRows.length,
        activeCategories: db.categories.filter((category) => category.active).length,
        criticalItems: criticalRows.length,
        entriesInPeriod: db.entries.filter((entry) => isWithinPeriod(entry.entryDate, period))
            .length,
        deliveriesInPeriod: db.deliveries.filter((delivery) =>
            isWithinPeriod(delivery.deliveredAt, period),
        ).length,
        pendingRequests: db.requests.filter((request) => request.status === REQUEST_STATUS.PENDING)
            .length,
        topCritical: criticalRows
            .toSorted((first, second) => criticalRatio(first) - criticalRatio(second))
            .slice(0, TOP_CRITICAL_LIMIT),
        recentMovements: buildRecentMovements(stockRows),
        monthly: buildMonthly(period),
        balanceByCategory: buildBalanceByCategory(activeRows),
        pendingList: buildPendingRequests(),
        previous: countInPeriod(previousPeriod(period)),
        generatedAt: nowIso(),
    }
}

export const mockGetDashboard = (period) => simulateRequest(() => buildSummary(period))
