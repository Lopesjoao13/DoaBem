import { mockCreateAdjustment, mockGetStock } from './mock/mockStock.js'

export const getStock = (filters) => mockGetStock(filters)

export const createAdjustment = (payload) => mockCreateAdjustment(payload)
