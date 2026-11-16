import { mockOnly } from './mockOnly.js'
import {
    mockGetMovement,
    mockListMovements,
    mockReverseMovement,
} from '@/services/mock/mockMovements.js'

export const listMovements = mockOnly((filters) => mockListMovements(filters))

export const getMovement = mockOnly((id) => mockGetMovement(id))

export const reverseMovement = mockOnly((id, reversal) => mockReverseMovement(id, reversal))
