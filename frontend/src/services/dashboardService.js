import { mockOnly } from './mockOnly.js'
import { mockGetDashboard } from '@/services/mock/mockDashboard.js'

export const getDashboard = mockOnly((period) => mockGetDashboard(period))
