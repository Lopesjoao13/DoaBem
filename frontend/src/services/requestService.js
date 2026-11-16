import { mockOnly } from './mockOnly.js'
import { mockGetDeliverySummary, mockGetFamilyHistory } from '@/services/mock/mockDeliveries.js'
import {
    mockCancelRequest,
    mockCreateRequest,
    mockDecideRequest,
    mockDeliverRequest,
    mockGetRequest,
    mockListRequests,
    mockPickRequest,
} from '@/services/mock/mockRequests.js'

export const listRequests = mockOnly((filters) => mockListRequests(filters))

export const getRequest = mockOnly((id) => mockGetRequest(id))

export const createRequest = mockOnly((request) => mockCreateRequest(request))

export const decideRequest = mockOnly((id, decision) => mockDecideRequest(id, decision))

export const pickRequest = mockOnly((id) => mockPickRequest(id))

export const deliverRequest = mockOnly((id, delivery) => mockDeliverRequest(id, delivery))

export const cancelRequest = mockOnly((id, cancellation) => mockCancelRequest(id, cancellation))

export const getDeliverySummary = mockOnly((beneficiaryId) => mockGetDeliverySummary(beneficiaryId))

export const getFamilyHistory = mockOnly((beneficiaryId) => mockGetFamilyHistory(beneficiaryId))
