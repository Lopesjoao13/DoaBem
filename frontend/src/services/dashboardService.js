import { USE_MOCK } from '@/constants/api.js'
import { httpClient } from './httpClient.js'
import { mockGetDashboard } from '@/services/mock/mockDashboard.js'

const api = {
    getDashboard: ({ from, to }) => httpClient.get('/dashboard', { from, to }),
}

const mock = {
    getDashboard: mockGetDashboard,
}

export const { getDashboard } = USE_MOCK ? mock : api
