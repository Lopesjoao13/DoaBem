import { Badge } from '@/components/Badge/Badge.jsx'
import {
    ADJUSTMENT_REASON_LABELS,
    MOVEMENT_TYPE_LABELS,
    MOVEMENT_TYPE_TONES,
    MOVEMENT_TYPES,
} from '@/constants/movementTypes.js'
import { formatDateTime, formatQuantity } from '@/utils/formatters.js'
import { MovementReference } from '@/pages/movements/components/MovementReference/MovementReference.jsx'

export const buildMovementDetails = (movement) => [
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
