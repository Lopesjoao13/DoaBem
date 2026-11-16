import { DATE_DIGITS, DATE_SEGMENT_SIZES, MIN_YEAR } from '@/constants/calendar.js'
import { isOutOfRange, pad } from '@/utils/calendar.js'

export const maskTypedDate = (raw) => {
    const rawSegments = raw.split('/')
    let carry = ''
    const segments = DATE_SEGMENT_SIZES.map((size, index) => {
        const digits = `${carry}${rawSegments[index] ?? ''}`.replace(/\D/g, '')
        carry = digits.slice(size)
        return digits.slice(0, size)
    })
    const lastFilled = segments.findLastIndex((segment) => segment !== '')
    return segments.slice(0, lastFilled + 1).join('/')
}

export const maskFromValue = (value) => {
    if (!value) return ''
    const [year, month, day] = value.split('-')
    return `${day}/${month}/${year}`
}

export const parseTypedDate = (masked, min, max) => {
    const digits = masked.replace(/\D/g, '')
    if (digits.length !== DATE_DIGITS) return null
    const day = Number(digits.slice(0, 2))
    const month = Number(digits.slice(2, 4))
    const year = Number(digits.slice(4, 8))
    if (month < 1 || month > 12 || year < MIN_YEAR) return null
    if (day < 1 || day > new Date(year, month, 0).getDate()) return null
    const value = `${year}-${pad(month)}-${pad(day)}`
    return isOutOfRange(value, min, max) ? null : value
}
