import { AsyncContent } from '@/components/AsyncContent/AsyncContent.jsx'
import { Badge } from '@/components/Badge/Badge.jsx'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { DescriptionList } from '@/components/DescriptionList/DescriptionList.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { Stack } from '@/components/Stack/Stack.jsx'
import { REVERSIBLE_MOVEMENT_TYPES } from '@/constants/movementMessages.js'
import {
    ADJUSTMENT_REASON_LABELS,
    MOVEMENT_TYPE_LABELS,
    MOVEMENT_TYPE_TONES,
    MOVEMENT_TYPES,
} from '@/constants/movementTypes.js'
import { PERMISSIONS } from '@/constants/permissions.js'
import { TONES } from '@/constants/tones.js'
import { useDisclosure } from '@/hooks/useDisclosure.js'
import { useMovementDetail } from '@/hooks/useMovementDetail.js'
import { usePermission } from '@/hooks/usePermission.js'
import { formatDateTime, formatQuantity } from '@/utils/formatters.js'
import { MovementReference } from '../MovementReference/MovementReference.jsx'
import { ReverseDialog } from '../ReverseDialog/ReverseDialog.jsx'
import { LinkButton } from './MovementDrawer.styles.js'

const buildDetails = (movement) => [
    {
        label: 'Tipo',
        value: (
            <Badge tone={MOVEMENT_TYPE_TONES[movement.type]}>
                {MOVEMENT_TYPE_LABELS[movement.type]}
            </Badge>
        ),
    },
    { label: 'Data/hora', value: formatDateTime(movement.occurredAt) },
    { label: 'Item', value: movement.itemName },
    { label: 'Quantidade', value: formatQuantity(movement.quantity, movement.unitOfMeasure) },
    { label: 'Responsável', value: movement.userName },
    { label: 'Referência', value: <MovementReference reference={movement.reference} /> },
    ...(movement.type === MOVEMENT_TYPES.ADJUSTMENT
        ? [
              {
                  label: 'Motivo do ajuste',
                  value: ADJUSTMENT_REASON_LABELS[movement.adjustmentReason],
              },
              { label: 'Observação', value: movement.reason },
          ]
        : []),
    ...(movement.type === MOVEMENT_TYPES.REVERSAL
        ? [{ label: 'Justificativa', value: movement.reason }]
        : []),
]

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

export const MovementDrawer = ({ movementId, onClose, onOpen, onChanged }) => {
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

    return (
        <>
            <Dialog
                isOpen
                title={`Lançamento #${movementId}`}
                description="Movimentações concluídas não são apagadas; correções são feitas por estorno."
                onClose={onClose}
                footer={
                    canReverse &&
                    isReversible && (
                        <Button
                            family="deny"
                            variant="outline"
                            onClick={() => reverseDialog.open()}
                        >
                            Estornar
                        </Button>
                    )
                }
            >
                <AsyncContent data={movement} error={error} onRetry={reload}>
                    {(data) => (
                        <Stack>
                            <DescriptionList items={buildDetails(data)} />
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
            {reverseDialog.isOpen && movement && (
                <ReverseDialog
                    movement={movement}
                    onClose={reverseDialog.close}
                    onDone={handleReversed}
                />
            )}
        </>
    )
}
