import { Outlet } from 'react-router-dom'
import { Panel } from '@/components/Panel/Panel.jsx'
import { StateMessage } from '@/components/StateMessage/StateMessage.jsx'
import { STATE_VARIANTS } from '@/constants/stateMessages.js'
import { useAuth } from '@/hooks/useAuth.js'
import { canAccess } from '@/utils/permissions.js'

export const RoleRoute = ({ allowedRoles }) => {
    const { user } = useAuth()

    if (canAccess(allowedRoles, user.role)) return <Outlet />

    return (
        <Panel>
            <StateMessage
                variant={STATE_VARIANTS.DENIED}
                description="Seu perfil não tem permissão para acessar esta página."
            />
        </Panel>
    )
}
