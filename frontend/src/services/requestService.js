import { mockGetDeliverySummary, mockGetFamilyHistory } from './mock/mockDeliveries.js'
import {
    mockCancelRequest,
    mockCreateRequest,
    mockDecideRequest,
    mockDeliverRequest,
    mockGetRequest,
    mockListRequests,
    mockPickRequest,
} from './mock/mockRequests.js'

export const listRequests = (filters) => mockListRequests(filters)

export const getRequest = (id) => mockGetRequest(id)

export const createRequest = (request) => mockCreateRequest(request)

export const decideRequest = (id, decision) => mockDecideRequest(id, decision)

export const pickRequest = (id) => mockPickRequest(id)

export const deliverRequest = (id, delivery) => mockDeliverRequest(id, delivery)

export const cancelRequest = (id, cancellation) => mockCancelRequest(id, cancellation)

export const getDeliverySummary = (beneficiaryId) => mockGetDeliverySummary(beneficiaryId)

export const getFamilyHistory = (beneficiaryId) => mockGetFamilyHistory(beneficiaryId)
