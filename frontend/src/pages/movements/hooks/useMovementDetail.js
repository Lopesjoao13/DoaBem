import { QUERY_KEYS } from '@/constants/queryKeys.js'
import { useFetch } from '@/hooks/useFetch.js'
import { getMovement } from '@/services/movementService.js'

export const useMovementDetail = (id) => {
    const { data, error, reload } = useFetch([QUERY_KEYS.MOVEMENTS, id], () => getMovement(id))
    return { movement: data, error, reload }
}
