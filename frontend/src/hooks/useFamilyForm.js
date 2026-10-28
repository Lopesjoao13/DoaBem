import { FAMILY_MESSAGES } from '@/constants/familyMessages.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { useForm } from '@/hooks/useForm.js'
import { useToast } from '@/hooks/useToast.js'
import { createBeneficiary, updateBeneficiary } from '@/services/beneficiaryService.js'
import { isBlank } from '@/utils/validation.js'

const validate = (values) => {
    const errors = {}
    const size = Number(values.householdSize)
    if (isBlank(values.responsibleName)) errors.responsibleName = VALIDATION_MESSAGES.required
    if (!Number.isInteger(size) || size <= 0)
        errors.householdSize = VALIDATION_MESSAGES.integerPositive
    return errors
}

const saveFamily = (values, family) => {
    const payload = { ...values, householdSize: Number(values.householdSize) }
    return family ? updateBeneficiary(family.id, payload) : createBeneficiary(payload)
}

export const useFamilyForm = ({ family, onSaved }) => {
    const toast = useToast()
    return useForm({
        initialValues: {
            responsibleName: family?.responsibleName ?? '',
            phone: family?.phone ?? '',
            neighborhood: family?.neighborhood ?? '',
            householdSize: family ? String(family.householdSize) : '',
            notes: family?.notes ?? '',
        },
        validate,
        onSubmit: async (values) => {
            const saved = await saveFamily(values, family)
            toast.success(FAMILY_MESSAGES.saved)
            onSaved(saved)
        },
    })
}
