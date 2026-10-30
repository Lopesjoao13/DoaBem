import { USER_MESSAGES } from '@/constants/userMessages.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { useForm } from '@/hooks/useForm.js'
import { useToast } from '@/hooks/useToast.js'
import { createUser, updateUser } from '@/services/userService.js'
import { EMAIL_PATTERN, isBlank, isValidPassword } from '@/utils/validation.js'

const buildValidator = (isNew) => (values) => {
    const errors = {}
    if (isBlank(values.name)) errors.name = VALIDATION_MESSAGES.required
    if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = VALIDATION_MESSAGES.emailInvalid
    if (isNew && !isValidPassword(values.password))
        errors.password = VALIDATION_MESSAGES.passwordLength
    if (!values.role) errors.role = VALIDATION_MESSAGES.required
    return errors
}

const saveUser = ({ name, email, password, role }, user) =>
    user ? updateUser(user.id, { name, email, role }) : createUser({ name, email, password, role })

export const useUserForm = ({ user, onSaved }) => {
    const toast = useToast()
    return useForm({
        initialValues: {
            name: user?.name ?? '',
            email: user?.email ?? '',
            password: '',
            role: user?.role ?? '',
        },
        validate: buildValidator(!user),
        onSubmit: async (values) => {
            await saveUser(values, user)
            toast.success(USER_MESSAGES.saved)
            onSaved()
        },
    })
}
