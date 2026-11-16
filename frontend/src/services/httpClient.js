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

const ARRAY_INDEX = /^(.+)\[(\d+)\]$/

const setNested = (target, path, message) => {
    const keys = path.split('.')
    keys.reduce((node, key, position) => {
        const [, name, index] = key.match(ARRAY_INDEX) ?? [null, key, null]
        const isLast = position === keys.length - 1
        if (index === null) {
            node[name] = isLast ? message : (node[name] ?? {})
            return node[name]
        }
        node[name] ??= []
        node[name][Number(index)] = isLast ? message : (node[name][Number(index)] ?? {})
        return node[name][Number(index)]
    }, target)
}

// O backend devolve chaves planas ("lines[0].itemId", "approved.12"); os formulários esperam objetos aninhados.
const nestFieldErrors = (fieldErrors) => {
    if (!fieldErrors) return null
    const nested = {}
    Object.entries(fieldErrors).forEach(([path, message]) => setNested(nested, path, message))
    return nested
}

const toApiError = (error) => {
    if (!error.response) {
        return new ApiError(NETWORK_ERROR_STATUS, API_MESSAGES.network, null, { cause: error })
    }
    const { status, data } = error.response
    const message = data?.message || HTTP_STATUS_MESSAGES[status] || API_MESSAGES.unexpected
    return new ApiError(status, message, nestFieldErrors(data?.fieldErrors))
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

const isSpringPage = (data) =>
    Array.isArray(data?.content) && data.page !== null && typeof data.page === 'object'

const flattenPage = ({ content, page, ...rest }) => ({
    ...rest,
    content,
    page: page.number,
    size: page.size,
    totalElements: page.totalElements,
    totalPages: page.totalPages,
})

const request = async (config) => {
    const response = await client.request(config)
    return isSpringPage(response.data) ? flattenPage(response.data) : response.data
}

export const httpClient = {
    get: (url, params) => request({ method: 'get', url, params: cleanParams(params) }),
    post: (url, data) => request({ method: 'post', url, data }),
    put: (url, data) => request({ method: 'put', url, data }),
    patch: (url, data) => request({ method: 'patch', url, data }),
}
