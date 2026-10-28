import { Outlet } from 'react-router-dom'
import { Panel } from '@/components/Panel/Panel.jsx'
import { StateMessage } from '@/components/StateMessage/StateMessage.jsx'
import { STATE_VARIANTS } from '@/constants/stateMessages.js'

export const FeatureRoute = ({ isEnabled }) => {
    if (isEnabled) return <Outlet />

    return (
        <Panel>
            <StateMessage
                variant={STATE_VARIANTS.UNAVAILABLE}
                description="Esta tela ainda não tem API no backend. Ela volta quando o módulo for publicado."
            />
        </Panel>
    )
}
