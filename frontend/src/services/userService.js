import { LIST_ALL_PARAMS, USE_MOCK } from '@/constants/api.js'
import { httpClient } from './httpClient.js'
import {
    mockCreateUser,
    mockListUserOptions,
    mockListUsers,
    mockSetUserActive,
    mockUpdateUser,
} from './mock/mockUsers.js'

const api = {
    listUsers: () => httpClient.get('/users', LIST_ALL_PARAMS),
    createUser: (user) => httpClient.post('/users', user),
    updateUser: (id, user) => httpClient.put(`/users/${id}`, user),
    setUserActive: (id, active) => httpClient.patch(`/users/${id}/status`, { active }),
}

const mock = {
    listUsers: () => mockListUsers(LIST_ALL_PARAMS),
    createUser: mockCreateUser,
    updateUser: mockUpdateUser,
    setUserActive: mockSetUserActive,
}

export const { listUsers, createUser, updateUser, setUserActive } = USE_MOCK ? mock : api

export const listUserOptions = () => mockListUserOptions()
