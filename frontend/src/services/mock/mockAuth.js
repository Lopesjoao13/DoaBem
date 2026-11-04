import { HTTP_STATUS } from '@/constants/apiMessages.js'
import { LOGIN_MESSAGES } from '@/constants/loginMessages.js'
import { ApiError } from '@/services/apiError.js'
import { db } from './mockDb.js'

const NETWORK_DELAY_MS = 800
const TOKEN_TTL_SECONDS = 3600

const authenticate = ({ email, password }) => {
    const account = db.users.find((user) => user.email === email && user.password === password)

    if (!account?.active) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, LOGIN_MESSAGES.invalidCredentials)
    }

    return {
        accessToken: `mock-token-${account.id}`,
        tokenType: 'Bearer',
        expiresIn: TOKEN_TTL_SECONDS,
        name: account.name,
        role: account.role,
    }
}

export const mockLogin = (credentials) =>
    new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                resolve(authenticate(credentials))
            } catch (error) {
                reject(error)
            }
        }, NETWORK_DELAY_MS)
    })
