import { useCallback, useEffect, useState } from 'react'
import { API_MESSAGES } from '@/constants/apiMessages.js'

export const useFetch = (loader) => {
    const [data, setData] = useState(null)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let isCurrent = true

        const load = async () => {
            setIsLoading(true)
            setError('')
            try {
                const result = await loader()
                if (isCurrent) setData(result)
            } catch (loadError) {
                console.error('Falha ao carregar dados:', loadError.message)
                if (isCurrent) setError(loadError.message || API_MESSAGES.unexpected)
            } finally {
                if (isCurrent) setIsLoading(false)
            }
        }

        load()
        return () => {
            isCurrent = false
        }
    }, [loader, attempt])

    const reload = useCallback(() => {
        setAttempt((current) => current + 1)
    }, [])

    return { data, error, isLoading, reload }
}
