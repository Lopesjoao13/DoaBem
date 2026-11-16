import { CELLS_PER_GRID } from '@/constants/calendar.js'

export const pad = (value) => String(value).padStart(2, '0')

export const toDateValue = ({ year, month, day }) => `${year}-${pad(month)}-${pad(day)}`

export const parseValue = (value) => {
    if (!value) return null
    const [year, month, day] = value.split('-').map(Number)
    return { year, month, day }
}

export const shiftMonth = (year, month, delta) => {
    const index = month - 1 + delta
    return {
        year: year + Math.floor(index / 12),
        month: (((index % 12) + 12) % 12) + 1,
    }
}

export const buildDateCells = (viewYear, viewMonth) => {
    const firstWeekday = new Date(viewYear, viewMonth - 1, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate()
    const daysInPrevMonth = new Date(viewYear, viewMonth - 1, 0).getDate()
    const previous = shiftMonth(viewYear, viewMonth, -1)
    const next = shiftMonth(viewYear, viewMonth, 1)

    const leading = Array.from({ length: firstWeekday }, (_, index) => ({
        ...previous,
        day: daysInPrevMonth - firstWeekday + index + 1,
        current: false,
    }))
    const current = Array.from({ length: daysInMonth }, (_, index) => ({
        year: viewYear,
        month: viewMonth,
        day: index + 1,
        current: true,
    }))
    const trailing = Array.from(
        { length: CELLS_PER_GRID - leading.length - current.length },
        (_, index) => ({ ...next, day: index + 1, current: false }),
    )
    return [...leading, ...current, ...trailing]
}

export const isOutOfRange = (dateValue, min, max) =>
    Boolean((min && dateValue < min) || (max && dateValue > max))
