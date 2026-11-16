const DAY_MS = 24 * 60 * 60 * 1000

export const toIsoDate = (date) => {
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
    return offsetDate.toISOString().slice(0, 10)
}

export const getLastDaysRange = (days, today = new Date()) => ({
    from: toIsoDate(new Date(today.getTime() - days * DAY_MS)),
    to: toIsoDate(today),
})

export const getTodayIso = () => toIsoDate(new Date())
