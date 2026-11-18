import { QUERY_KEYS } from '@/constants/queryKeys.js'
import { useFetch } from '@/hooks/useFetch.js'
import { getBeneficiary } from '@/services/beneficiaryService.js'

export const useFamilyDetail = (id) => {
    const { data, error, reload } = useFetch([QUERY_KEYS.BENEFICIARIES, id], () =>
        getBeneficiary(id),
    )
    return { family: data, error, reload }
}
