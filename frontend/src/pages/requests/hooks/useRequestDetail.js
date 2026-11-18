import { PERMISSIONS } from '@/constants/permissions.js'
import { REQUEST_STATUS } from '@/constants/requestStatus.js'
import { QUERY_KEYS } from '@/constants/queryKeys.js'
import { useFetch } from '@/hooks/useFetch.js'
import { usePermission } from '@/hooks/usePermission.js'
import { getRequest } from '@/services/requestService.js'

const resolveActions = (request, { canDecide, canCancelOpen, canCancelPicked }) => {
    if (!request) return {}
    const { status } = request
    const isOpen = status === REQUEST_STATUS.PENDING || status === REQUEST_STATUS.APPROVED
    return {
        canDecide: canDecide && status === REQUEST_STATUS.PENDING,
        canReopen: canDecide && status === REQUEST_STATUS.APPROVED,
        canPick: status === REQUEST_STATUS.APPROVED,
        canDeliver: status === REQUEST_STATUS.PICKED,
        canCancel:
            (isOpen && canCancelOpen) || (status === REQUEST_STATUS.PICKED && canCancelPicked),
        isAwaitingDecision: !canDecide && status === REQUEST_STATUS.PENDING,
    }
}

export const useRequestDetail = (id) => {
    const { data, error, reload } = useFetch([QUERY_KEYS.REQUESTS, id], () => getRequest(id))
    const permissions = {
        canDecide: usePermission(PERMISSIONS.DECIDE_REQUEST),
        canCancelOpen: usePermission(PERMISSIONS.CANCEL_OPEN_REQUEST),
        canCancelPicked: usePermission(PERMISSIONS.CANCEL_PICKED_REQUEST),
    }

    return { request: data, error, reload, actions: resolveActions(data, permissions) }
}
