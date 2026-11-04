import { MOVEMENT_MESSAGES } from '@/constants/movementMessages.js'
import { MOVEMENT_TYPES } from '@/constants/movementTypes.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { useForm } from '@/hooks/useForm.js'
import { useToast } from '@/hooks/useToast.js'
import { reverseMovement } from '@/services/movementService.js'
import { isBlank } from '@/utils/validation.js'

export const useReverseForm = ({ movement, onDone }) => {
    const toast = useToast()
    return useForm({
        initialValues: { justification: '', itemsReturned: false },
        validate: (values) => {
            const errors = {}
            if (isBlank(values.justification))
                errors.justification = VALIDATION_MESSAGES.justificationRequired
            if (movement.type === MOVEMENT_TYPES.DELIVERY && !values.itemsReturned) {
                errors.itemsReturned = MOVEMENT_MESSAGES.deliveryReverseHint
            }
            return errors
        },
        onSubmit: async (values) => {
            await reverseMovement(movement.id, values)
            toast.success(MOVEMENT_MESSAGES.reversed)
            onDone()
        },
    })
}
