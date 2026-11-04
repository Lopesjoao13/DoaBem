import { API_MESSAGES, DEFAULT_PAGE_SIZE, HTTP_STATUS } from '@/constants/apiMessages.js'
import { ApiError } from '@/services/apiError.js'
import { db } from './mockDb.js'

const DATE_TIME_LENGTH = 19
const DATE_LENGTH = 10

const toLocalIso = (date) =>
    new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
        .toISOString()
        .slice(0, DATE_TIME_LENGTH)

export const nowIso = () => toLocalIso(new Date())

export const todayIso = () => nowIso().slice(0, DATE_LENGTH)

export const daysAgoIso = (days) => {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return toLocalIso(date)
}

export const findOrThrow = (collection, id) => {
    const record = collection.find((entry) => entry.id === Number(id))
    if (!record) throw new ApiError(HTTP_STATUS.NOT_FOUND, API_MESSAGES.notFound)
    return record
}

export const badRequest = (message, fieldErrors = null) =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, message, fieldErrors)

export const conflict = (message) => new ApiError(HTTP_STATUS.CONFLICT, message)

export const businessRule = (message) => new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, message)

export const forbidden = () => new ApiError(HTTP_STATUS.FORBIDDEN, API_MESSAGES.forbidden)

export const getUserName = (userId) => db.users.find((user) => user.id === userId)?.name ?? ''

export const getItem = (itemId) => db.items.find((item) => item.id === Number(itemId))

export const getBeneficiary = (beneficiaryId) =>
    db.beneficiaries.find((beneficiary) => beneficiary.id === Number(beneficiaryId))

export const normalizeText = (value) => String(value ?? '').trim()

export const sameText = (first, second) =>
    normalizeText(first).toLowerCase() === normalizeText(second).toLowerCase()

export const paginate = (rows, page = 0, size = DEFAULT_PAGE_SIZE) => ({
    content: rows.slice(page * size, page * size + size),
    page,
    size,
    totalElements: rows.length,
    totalPages: Math.ceil(rows.length / size),
})

export const isWithinPeriod = (value, { from, to }) => {
    const date = value.slice(0, DATE_LENGTH)
    return (!from || date >= from) && (!to || date <= to)
}
