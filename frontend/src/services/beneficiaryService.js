import { LIST_ALL_PARAMS, USE_MOCK } from '@/constants/api.js'
import { httpClient } from './httpClient.js'
import {
    mockCreateBeneficiary,
    mockGetBeneficiary,
    mockListBeneficiaries,
    mockSetBeneficiaryStatus,
    mockUpdateBeneficiary,
} from './mock/mockBeneficiaries.js'

const api = {
    listBeneficiaries: (filters) =>
        httpClient.get('/beneficiaries', { ...LIST_ALL_PARAMS, ...filters }),
    getBeneficiary: (id) => httpClient.get(`/beneficiaries/${id}`),
    createBeneficiary: (beneficiary) => httpClient.post('/beneficiaries', beneficiary),
    updateBeneficiary: (id, beneficiary) => httpClient.put(`/beneficiaries/${id}`, beneficiary),
    setBeneficiaryStatus: (id, status) =>
        httpClient.patch(`/beneficiaries/${id}/status`, { status }),
}

const mock = {
    listBeneficiaries: (filters) => mockListBeneficiaries({ ...LIST_ALL_PARAMS, ...filters }),
    getBeneficiary: mockGetBeneficiary,
    createBeneficiary: mockCreateBeneficiary,
    updateBeneficiary: mockUpdateBeneficiary,
    setBeneficiaryStatus: mockSetBeneficiaryStatus,
}

export const {
    listBeneficiaries,
    getBeneficiary,
    createBeneficiary,
    updateBeneficiary,
    setBeneficiaryStatus,
} = USE_MOCK ? mock : api
