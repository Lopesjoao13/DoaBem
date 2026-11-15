import { QUERY_KEYS } from '@/constants/queryKeys.js'
import { useFetch } from '@/hooks/useFetch.js'
import { getFamilyHistory } from '@/services/requestService.js'

export const useFamilyHistory = (familyId) => {
    const { data, error, reload } = useFetch([QUERY_KEYS.FAMILY_HISTORY, familyId], () =>
        getFamilyHistory(familyId),
    )
    return { history: data, error, reload }
}
