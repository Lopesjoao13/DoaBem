import { UNIT_DECIMALS, UNIT_LABELS } from '@/constants/units.js'

const LOCALE = 'pt-BR'
const DATE_ONLY_LENGTH = 10

const parseDate = (value) =>
    new Date(value.length === DATE_ONLY_LENGTH ? `${value}T00:00:00` : value)

export const formatNumber = (value, maximumFractionDigits = 0) =>
    value.toLocaleString(LOCALE, { maximumFractionDigits })

export const formatQuantity = (quantity, unit) =>
    `${formatNumber(quantity, UNIT_DECIMALS[unit])} ${UNIT_LABELS[unit]}`

export const formatDate = (value) => parseDate(value).toLocaleDateString(LOCALE)

export const formatDateTime = (value) =>
    parseDate(value).toLocaleString(LOCALE, { dateStyle: 'short', timeStyle: 'short' })

export const formatMonth = (monthKey) =>
    parseDate(`${monthKey}-01`).toLocaleDateString(LOCALE, { month: 'short' }).replace('.', '')

export const formatMonthYear = (monthKey) =>
    parseDate(`${monthKey}-01`).toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })
