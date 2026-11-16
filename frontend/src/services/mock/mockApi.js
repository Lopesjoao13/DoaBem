import { API_MESSAGES, HTTP_STATUS } from '@/constants/apiMessages.js'
import { ApiError } from '@/services/apiError.js'
import { loadSession } from '@/services/sessionStorageService.js'
import { db, persistDb } from './mockDb.js'

const MOCK_DELAY_MS = 500

const authorize = (allowedRoles) => {
    const email = loadSession()?.user.email
    const currentUser = db.users.find((user) => user.email === email && user.active)
    if (!currentUser) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, API_MESSAGES.unauthorized)
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, API_MESSAGES.forbidden)
    }
    return currentUser
}

export const simulateRequest = (handler, { allowedRoles } = {}) =>
    new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                const currentUser = authorize(allowedRoles)
                const result = handler(currentUser)
                persistDb()
                resolve(structuredClone(result))
            } catch (error) {
                reject(error)
            }
        }, MOCK_DELAY_MS)
    })
