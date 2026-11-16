import { MOVEMENT_TYPES } from '@/constants/movementTypes.js'
import { STOCK_LEVELS } from '@/constants/stockLevels.js'

const LOW_STOCK_FACTOR = 1.5
const QUANTITY_PRECISION = 1000

const PHYSICAL_EFFECT = {
    [MOVEMENT_TYPES.ENTRY]: 1,
    [MOVEMENT_TYPES.DELIVERY]: -1,
    [MOVEMENT_TYPES.ADJUSTMENT]: -1,
}

const RESERVED_EFFECT = {
    [MOVEMENT_TYPES.RESERVE]: 1,
    [MOVEMENT_TYPES.RELEASE]: -1,
}

const roundQuantity = (value) => Math.round(value * QUANTITY_PRECISION) / QUANTITY_PRECISION

const resolveEffectSource = (movement, movementsById) => {
    if (movement.type !== MOVEMENT_TYPES.REVERSAL) return { source: movement, sign: 1 }
    return { source: movementsById.get(movement.reversesId), sign: -1 }
}

export const calculateBalances = (movements) => {
    const movementsById = new Map(movements.map((movement) => [movement.id, movement]))
    const totals = new Map()

    movements.forEach((movement) => {
        const { source, sign } = resolveEffectSource(movement, movementsById)
        const current = totals.get(movement.itemId) ?? { physical: 0, reserved: 0 }

        totals.set(movement.itemId, {
            physical:
                current.physical + sign * (PHYSICAL_EFFECT[source.type] ?? 0) * movement.quantity,
            reserved:
                current.reserved + sign * (RESERVED_EFFECT[source.type] ?? 0) * movement.quantity,
        })
    })

    return new Map(
        [...totals].map(([itemId, { physical, reserved }]) => [
            itemId,
            {
                physical: roundQuantity(physical),
                reserved: roundQuantity(reserved),
                available: roundQuantity(physical - reserved),
            },
        ]),
    )
}

export const getStockLevel = (available, minStock) => {
    if (available <= minStock) return STOCK_LEVELS.CRITICAL
    if (available <= minStock * LOW_STOCK_FACTOR) return STOCK_LEVELS.LOW
    return STOCK_LEVELS.NORMAL
}
