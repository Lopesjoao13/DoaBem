import { AsyncContent } from '@/components/AsyncContent/AsyncContent.jsx'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { DescriptionList } from '@/components/DescriptionList/DescriptionList.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { Stack } from '@/components/Stack/Stack.jsx'
import { DIALOG_KINDS } from '@/constants/dialog.js'
import { REVERSIBLE_MOVEMENT_TYPES } from '@/pages/movements/constants/movementMessages.js'
import { MOVEMENT_TYPE_LABELS } from '@/constants/movementTypes.js'
import { PERMISSIONS } from '@/constants/permissions.js'
import { TONES } from '@/constants/tones.js'
import { useDisclosure } from '@/hooks/useDisclosure.js'
import { useMovementDetail } from '@/pages/movements/hooks/useMovementDetail.js'
import { usePermission } from '@/hooks/usePermission.js'
import { formatDateTime } from '@/utils/formatters.js'
import { ReverseDialog } from '@/pages/movements/components/ReverseDialog/ReverseDialog.jsx'
import { LinkButton } from './MovementDetailDialog.styles.js'
import { buildMovementDetails } from '@/pages/movements/constants/movementDetails.jsx'

const LinkedMovement = ({ title, movement, onOpen }) => (
    <Callout tone={TONES.NEUTRAL} title={title}>
        <span>
            #{movement.id} · {MOVEMENT_TYPE_LABELS[movement.type]} ·{' '}
            {formatDateTime(movement.occurredAt)} · {movement.userName}
        </span>
        {movement.reason && <span>Justificativa: {movement.reason}</span>}
        <LinkButton type="button" onClick={() => onOpen(movement.id)}>
            Abrir lançamento #{movement.id}
        </LinkButton>
    </Callout>
)

export const MovementDetailDialog = ({ movementId, onClose, onOpen, onChanged }) => {
    const { movement, error, reload } = useMovementDetail(movementId)
    const canReverse = usePermission(PERMISSIONS.REVERSE_MOVEMENT)
    const reverseDialog = useDisclosure()
    const isReversible =
        movement && REVERSIBLE_MOVEMENT_TYPES.includes(movement.type) && !movement.reversedById

    const handleReversed = () => {
        reverseDialog.close()
        reload()
        onChanged()
    }

    if (reverseDialog.isOpen && movement) {
        return (
            <ReverseDialog
                movement={movement}
                onClose={reverseDialog.close}
                onDone={handleReversed}
            />
        )
    }

    return (
        <Dialog
            isOpen
            kind={DIALOG_KINDS.VIEW}
            title={`Lançamento #${movementId}`}
            description="Movimentações concluídas não são apagadas; correções são feitas por estorno."
            onClose={onClose}
            footer={
                canReverse &&
                isReversible && (
                    <Button family="deny" variant="outline" onClick={() => reverseDialog.open()}>
                        Estornar
                    </Button>
                )
            }
        >
            <AsyncContent data={movement} error={error} onRetry={reload}>
                {(data) => (
                    <Stack>
                        <DescriptionList items={buildMovementDetails(data)} />
                        {data.original && (
                            <LinkedMovement
                                title="Estorno do lançamento"
                                movement={data.original}
                                onOpen={onOpen}
                            />
                        )}
                        {data.reversal && (
                            <LinkedMovement
                                title="Estornado por"
                                movement={data.reversal}
                                onOpen={onOpen}
                            />
                        )}
                    </Stack>
                )}
            </AsyncContent>
        </Dialog>
    )
}
