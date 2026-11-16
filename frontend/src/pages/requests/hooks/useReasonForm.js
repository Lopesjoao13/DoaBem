import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { useForm } from '@/hooks/useForm.js'
import { useToast } from '@/hooks/useToast.js'
import { isBlank } from '@/utils/validation.js'

export const useReasonForm = ({
    field = 'reason',
    required = true,
    action,
    successMessage,
    onDone,
}) => {
    const toast = useToast()
    return useForm({
        initialValues: { [field]: '' },
        validate: (values) =>
            required && isBlank(values[field])
                ? { [field]: VALIDATION_MESSAGES.reasonRequired }
                : {},
        onSubmit: async (values) => {
            await action(values)
            toast.success(successMessage)
            onDone()
        },
    })
}
