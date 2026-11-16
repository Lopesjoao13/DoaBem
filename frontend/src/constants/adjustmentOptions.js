import { ADJUSTMENT_REASON_LABELS, ADJUSTMENT_REASONS } from '@/constants/movementTypes.js'

export const REASON_OPTIONS = Object.values(ADJUSTMENT_REASONS).map((reason) => ({
    value: reason,
    label: ADJUSTMENT_REASON_LABELS[reason],
}))

export const SELECT_REASON = { value: '', label: 'Selecione o motivo' }
