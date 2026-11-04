import { USE_MOCK } from '@/constants/api.js'
import { httpClient } from './httpClient.js'
import { mockLogin } from './mock/mockAuth.js'

const MS_PER_SECOND = 1000

const toSession = (response, email) => ({
    token: response.accessToken,
    expiresAt: Date.now() + response.expiresIn * MS_PER_SECOND,
    user: { name: response.name, email, role: response.role },
})

const requestLogin = (credentials) =>
    USE_MOCK ? mockLogin(credentials) : httpClient.post('/auth/login', credentials)

export const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase()
    const response = await requestLogin({ email: normalizedEmail, password })
    return toSession(response, normalizedEmail)
}
