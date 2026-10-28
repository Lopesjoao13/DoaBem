import { CATALOG_MESSAGES } from '@/constants/catalogMessages.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { useForm } from '@/hooks/useForm.js'
import { useToast } from '@/hooks/useToast.js'
import { createCategory, updateCategory } from '@/services/catalogService.js'
import { isBlank } from '@/utils/validation.js'

const validate = (values) => (isBlank(values.name) ? { name: VALIDATION_MESSAGES.required } : {})

const saveCategory = (values, category) =>
    category ? updateCategory(category.id, values) : createCategory(values)

export const useCategoryForm = ({ category, onSaved }) => {
    const toast = useToast()
    return useForm({
        initialValues: {
            name: category?.name ?? '',
            description: category?.description ?? '',
        },
        validate,
        onSubmit: async (values) => {
            await saveCategory(values, category)
            toast.success(CATALOG_MESSAGES.categorySaved)
            onSaved()
        },
    })
}
