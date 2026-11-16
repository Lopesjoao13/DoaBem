import { Button } from '@/components/Button/Button.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { StateMessage } from '@/components/StateMessage/StateMessage.jsx'
import { STATE_VARIANTS } from '@/constants/stateMessages.js'

export const AsyncContent = ({ data, error, onRetry, children }) => {
    if (error) {
        return (
            <Panel>
                <StateMessage
                    variant={STATE_VARIANTS.ERROR}
                    description={error}
                    action={
                        onRetry && (
                            <Button variant="outline" onClick={onRetry}>
                                Tentar novamente
                            </Button>
                        )
                    }
                />
            </Panel>
        )
    }

    if (!data) {
        return (
            <Panel>
                <StateMessage variant={STATE_VARIANTS.LOADING} />
            </Panel>
        )
    }

    return children(data)
}
