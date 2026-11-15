import { USE_MOCK } from '@/constants/api.js'
import { httpClient } from './httpClient.js'
import { mockCreateAdjustment, mockGetStock } from '@/services/mock/mockStock.js'

const api = {
    getStock: (filters) => httpClient.get('/stock', filters),
    createAdjustment: (payload) => httpClient.post('/stock/adjustments', payload),
}

const mock = {
    getStock: (filters) => mockGetStock(filters),
    createAdjustment: (payload) => mockCreateAdjustment(payload),
}

export const { getStock, createAdjustment } = USE_MOCK ? mock : api
