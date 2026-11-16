import { LIST_ALL_PARAMS, USE_MOCK } from '@/constants/api.js'
import { httpClient } from './httpClient.js'
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

const api = {
    listRequests: (filters) => httpClient.get('/requests', { ...LIST_ALL_PARAMS, ...filters }),
    getRequest: (id) => httpClient.get(`/requests/${id}`),
    createRequest: (request) => httpClient.post('/requests', request),
    decideRequest: (id, decision) => httpClient.post(`/requests/${id}/decision`, decision),
    pickRequest: (id) => httpClient.post(`/requests/${id}/pick`),
    deliverRequest: (id, delivery) => httpClient.post(`/requests/${id}/deliver`, delivery),
    cancelRequest: (id, cancellation) => httpClient.post(`/requests/${id}/cancel`, cancellation),
    getDeliverySummary: (beneficiaryId) =>
        httpClient.get(`/beneficiaries/${beneficiaryId}/delivery-summary`),
    getFamilyHistory: (beneficiaryId) => httpClient.get(`/beneficiaries/${beneficiaryId}/requests`),
}

const mock = {
    listRequests: mockListRequests,
    getRequest: mockGetRequest,
    createRequest: mockCreateRequest,
    decideRequest: mockDecideRequest,
    pickRequest: mockPickRequest,
    deliverRequest: mockDeliverRequest,
    cancelRequest: mockCancelRequest,
    getDeliverySummary: mockGetDeliverySummary,
    getFamilyHistory: mockGetFamilyHistory,
}

export const {
    listRequests,
    getRequest,
    createRequest,
    decideRequest,
    pickRequest,
    deliverRequest,
    cancelRequest,
    getDeliverySummary,
    getFamilyHistory,
} = USE_MOCK ? mock : api
