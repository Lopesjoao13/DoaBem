import axios from 'axios'
import { API_BASE_URL } from '@/constants/api.js'
import {
    API_MESSAGES,
    HTTP_STATUS,
    HTTP_STATUS_MESSAGES,
    NETWORK_ERROR_STATUS,
} from '@/constants/apiMessages.js'
import { ROUTES } from '@/constants/routes.js'
import { ApiError } from './apiError.js'
import { clearSession, loadSession } from './sessionStorageService.js'

const isFilled = (value) => value !== undefined && value !== null && value !== ''

const cleanParams = (params = {}) =>
    Object.fromEntries(Object.entries(params).filter(([, value]) => isFilled(value)))

const expireSession = () => {
    clearSession()
    window.location.assign(ROUTES.LOGIN)
}

const toApiError = (error) => {
    if (!error.response) {
        return new ApiError(NETWORK_ERROR_STATUS, API_MESSAGES.network, null, { cause: error })
    }
    const { status, data } = error.response
    const message = data?.message || HTTP_STATUS_MESSAGES[status] || API_MESSAGES.unexpected
    return new ApiError(status, message)
}

const client = axios.create({
    baseURL: API_BASE_URL,
    headers: { Accept: 'application/json' },
})

client.interceptors.request.use((config) => {
    const token = loadSession()?.token
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && loadSession()) expireSession()
        return Promise.reject(toApiError(error))
    },
)

const request = async (config) => {
    const response = await client.request(config)
    return response.data
}

export const httpClient = {
    get: (url, params) => request({ method: 'get', url, params: cleanParams(params) }),
    post: (url, data) => request({ method: 'post', url, data }),
    put: (url, data) => request({ method: 'put', url, data }),
    patch: (url, data) => request({ method: 'patch', url, data }),
}
