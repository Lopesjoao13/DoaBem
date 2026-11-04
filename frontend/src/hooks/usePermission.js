import { useAuth } from '@/hooks/useAuth.js'
import { canAccess } from '@/utils/permissions.js'

export const usePermission = (allowedRoles) => {
    const { user } = useAuth()
    return canAccess(allowedRoles, user?.role)
}
