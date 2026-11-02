import { USE_MOCK } from '@/constants/api.js'
import { API_MESSAGES, HTTP_STATUS } from '@/constants/apiMessages.js'
import { ApiError } from './apiError.js'

const notImplemented = () =>
    Promise.reject(new ApiError(HTTP_STATUS.NOT_IMPLEMENTED, API_MESSAGES.notImplemented))

export const mockOnly = (implementation) => (USE_MOCK ? implementation : notImplemented)
