import { useCallback } from 'react'
import { useFetch } from '@/hooks/useFetch.js'
import { getMovement } from '@/services/movementService.js'

export const useMovementDetail = (id) => {
    const loadMovement = useCallback(() => getMovement(id), [id])
    const { data, error, reload } = useFetch(loadMovement)
    return { movement: data, error, reload }
}
