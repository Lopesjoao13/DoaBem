import { LISTED_MOVEMENT_TYPES } from '@/constants/movementTypes.js'
import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { REQUEST_STATUS } from '@/constants/requestStatus.js'
import { STOCK_LEVELS } from '@/constants/stockLevels.js'
import { db } from './mockDb.js'
import { simulateRequest } from './mockApi.js'
import { isWithinPeriod } from './mockHelpers.js'
import { buildStockRows } from './mockStock.js'

const TOP_CRITICAL_LIMIT = 5
const RECENT_MOVEMENTS_LIMIT = 6
const MONTH_LENGTH = 7
const CHART_MONTHS = 6

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

const listMonthKeys = (endDate) => {
    const end = endDate ? new Date(`${endDate}T00:00:00`) : new Date()
    return Array.from({ length: CHART_MONTHS }, (_, index) =>
        toMonthKey(new Date(end.getFullYear(), end.getMonth() - (CHART_MONTHS - 1 - index), 1)),
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

    return listMonthKeys(period.to).map((month) => ({
        month,
        entries: entries[month] ?? 0,
        deliveries: deliveries[month] ?? 0,
    }))
}

const buildLevelsByCategory = (activeRows) =>
    db.categories
        .filter((category) => category.active)
        .map((category) => {
            const rows = activeRows.filter((row) => row.categoryId === category.id)
            const countLevel = (level) => rows.filter((row) => row.level === level).length
            return {
                categoryId: category.id,
                categoryName: category.name,
                critical: countLevel(STOCK_LEVELS.CRITICAL),
                low: countLevel(STOCK_LEVELS.LOW),
                normal: countLevel(STOCK_LEVELS.NORMAL),
            }
        })
        .sort((first, second) => first.categoryName.localeCompare(second.categoryName))

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
        levelsByCategory: buildLevelsByCategory(activeRows),
    }
}

export const mockGetDashboard = (period) => simulateRequest(() => buildSummary(period))
