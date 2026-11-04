import { useFetch } from '@/hooks/useFetch.js'
import { listUsers } from '@/services/userService.js'

const EMPTY_ROWS = []

export const useUsers = () => {
    const { data, error, isLoading, reload } = useFetch(listUsers)
    return { users: data?.content ?? EMPTY_ROWS, error, isLoading: isLoading && !data, reload }
}
