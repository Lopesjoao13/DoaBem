import { LIST_ALL_PARAMS, USE_MOCK } from '@/constants/api.js'
import { httpClient } from './httpClient.js'
import {
    mockCreateUser,
    mockListUserOptions,
    mockListUsers,
    mockSetUserActive,
    mockUpdateUser,
} from '@/services/mock/mockUsers.js'

const api = {
    listUsers: () => httpClient.get('/users', LIST_ALL_PARAMS),
    getUser: (id) => httpClient.get(`/users/${id}`),
    listUserOptions: () => httpClient.get('/users/options'),
    createUser: (user) => httpClient.post('/users', user),
    updateUser: (id, user) => httpClient.put(`/users/${id}`, user),
    setUserActive: (id, active) => httpClient.patch(`/users/${id}/status`, { active }),
}

const mock = {
    listUsers: () => mockListUsers(LIST_ALL_PARAMS),
    getUser: (id) =>
        mockListUsers(LIST_ALL_PARAMS).then(({ content }) =>
            content.find((user) => user.id === Number(id)),
        ),
    listUserOptions: () => mockListUserOptions(),
    createUser: mockCreateUser,
    updateUser: mockUpdateUser,
    setUserActive: mockSetUserActive,
}

export const { listUsers, listUserOptions, getUser, createUser, updateUser, setUserActive } =
    USE_MOCK ? mock : api
