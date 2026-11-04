import { LIST_ALL_PARAMS, USE_MOCK } from '@/constants/api.js'
import { httpClient } from './httpClient.js'
import { mockCreateEntry, mockGetEntry, mockListEntries } from './mock/mockEntries.js'

const api = {
    listEntries: () => httpClient.get('/donation-entries', LIST_ALL_PARAMS),
    getEntry: (id) => httpClient.get(`/donation-entries/${id}`),
    createEntry: (entry) => httpClient.post('/donation-entries', entry),
}

const mock = {
    listEntries: () => mockListEntries(LIST_ALL_PARAMS),
    getEntry: mockGetEntry,
    createEntry: mockCreateEntry,
}

export const { listEntries, getEntry, createEntry } = USE_MOCK ? mock : api
