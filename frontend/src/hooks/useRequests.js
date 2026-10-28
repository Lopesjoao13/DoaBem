import { useCallback, useState } from 'react'
import { ALL_REQUESTS_TAB, REQUEST_STATUS } from '@/constants/requestStatus.js'
import { useFetch } from '@/hooks/useFetch.js'
import { listRequests } from '@/services/requestService.js'

const EMPTY_ROWS = []
const EMPTY_COUNTS = {}

export const useRequests = () => {
    const [tab, setTab] = useState(REQUEST_STATUS.PENDING)

    const loadRequests = useCallback(
        () => listRequests({ status: tab === ALL_REQUESTS_TAB ? undefined : tab }),
        [tab],
    )
    const { data, error, isLoading, reload } = useFetch(loadRequests)

    const changeTab = (value) => {
        setTab(value)
    }

    return {
        requests: data?.content ?? EMPTY_ROWS,
        counts: data?.counts ?? EMPTY_COUNTS,
        tab,
        error,
        isLoading,
        reload,
        changeTab,
    }
}
