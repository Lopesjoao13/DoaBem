import { useMemo } from 'react'
import { SIDEBAR_GROUPS } from '@/constants/sideBarItems.js'
import { canAccess } from '@/utils/permissions.js'

export const useSideBarGroups = (role) =>
    useMemo(
        () =>
            SIDEBAR_GROUPS.map((group) => ({
                ...group,
                items: group.items.filter((item) => canAccess(item.allowedRoles, role)),
            })).filter((group) => group.items.length > 0),
        [role],
    )
