import { mockGetMovement, mockListMovements, mockReverseMovement } from './mock/mockMovements.js'

export const listMovements = (filters) => mockListMovements(filters)

export const getMovement = (id) => mockGetMovement(id)

export const reverseMovement = (id, reversal) => mockReverseMovement(id, reversal)
