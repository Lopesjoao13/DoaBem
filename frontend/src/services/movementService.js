import { USE_MOCK } from '@/constants/api.js'
import { DEFAULT_PAGE_SIZE } from '@/constants/apiMessages.js'
import { httpClient } from './httpClient.js'
import {
    mockGetMovement,
    mockListMovements,
    mockReverseMovement,
} from '@/services/mock/mockMovements.js'

const api = {
    listMovements: (filters) =>
        httpClient.get('/movements', { size: DEFAULT_PAGE_SIZE, ...filters }),
    getMovement: (id) => httpClient.get(`/movements/${id}`),
    reverseMovement: (id, reversal) => httpClient.post(`/movements/${id}/reverse`, reversal),
}

const mock = {
    listMovements: mockListMovements,
    getMovement: mockGetMovement,
    reverseMovement: mockReverseMovement,
}

export const { listMovements, getMovement, reverseMovement } = USE_MOCK ? mock : api
