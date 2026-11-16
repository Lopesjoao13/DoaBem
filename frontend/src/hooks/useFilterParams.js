import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

const parseValue = (raw, fallback, isValid) => {
    if (raw === null) return fallback
    const parsed = Array.isArray(fallback) ? raw.split(',').filter(Boolean) : raw
    return !isValid || isValid(parsed) ? parsed : fallback
}

const isSameValue = (first, second) =>
    Array.isArray(first)
        ? first.length === second.length && first.every((item) => second.includes(item))
        : first === second

const serialize = (value) => (Array.isArray(value) ? value.join(',') : value)

export const useFilterParams = (defaults, validators = {}) => {
    const [searchParams, setSearchParams] = useSearchParams()

    const filters = useMemo(
        () =>
            Object.fromEntries(
                Object.entries(defaults).map(([key, fallback]) => [
                    key,
                    parseValue(searchParams.get(key), fallback, validators[key]),
                ]),
            ),
        [searchParams, defaults, validators],
    )

    const setFilters = useCallback(
        (patch) =>
            setSearchParams(
                (current) => {
                    const next = new URLSearchParams(current)
                    Object.entries(patch).forEach(([key, value]) => {
                        if (isSameValue(value, defaults[key])) next.delete(key)
                        else next.set(key, serialize(value))
                    })
                    return next
                },
                { replace: true },
            ),
        [defaults, setSearchParams],
    )

    const clearFilters = useCallback(
        () =>
            setSearchParams(
                (current) => {
                    const next = new URLSearchParams(current)
                    Object.keys(defaults).forEach((key) => next.delete(key))
                    return next
                },
                { replace: true },
            ),
        [defaults, setSearchParams],
    )

    const isFiltered = Object.keys(defaults).some(
        (key) => !isSameValue(filters[key], defaults[key]),
    )

    return { filters, setFilters, clearFilters, isFiltered }
}
