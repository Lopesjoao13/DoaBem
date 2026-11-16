import { mockOnly } from './mockOnly.js'
import { mockCreateAdjustment, mockGetStock } from '@/services/mock/mockStock.js'

export const getStock = mockOnly((filters) => mockGetStock(filters))

export const createAdjustment = mockOnly((payload) => mockCreateAdjustment(payload))
