import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isId } from '@/utils/validators.js'

export const useDetailParam = (name) => {
    const [searchParams, setSearchParams] = useSearchParams()

    const open = useCallback(
        (value) =>
            setSearchParams((current) => {
                const next = new URLSearchParams(current)
                next.set(name, value)
                return next
            }),
        [name, setSearchParams],
    )

    const close = useCallback(
        () =>
            setSearchParams((current) => {
                const next = new URLSearchParams(current)
                next.delete(name)
                return next
            }),
        [name, setSearchParams],
    )

    const raw = searchParams.get(name)

    return { id: raw !== null && isId(raw) ? raw : null, open, close }
}
