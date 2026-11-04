import { CATALOG_MESSAGES } from '@/constants/catalogMessages.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { useForm } from '@/hooks/useForm.js'
import { useToast } from '@/hooks/useToast.js'
import { createItem, updateItem } from '@/services/catalogService.js'
import { parseQuantity, validateQuantity } from '@/utils/quantity.js'
import { isBlank } from '@/utils/validation.js'

const toInitialValues = (item) => ({
    name: item?.name ?? '',
    categoryId: item ? String(item.categoryId) : '',
    unitOfMeasure: item?.unitOfMeasure ?? '',
    minStock: item ? String(item.minStock) : '0',
})

const validate = (values) => {
    const errors = {}
    if (isBlank(values.name)) errors.name = VALIDATION_MESSAGES.required
    if (!values.categoryId) errors.categoryId = VALIDATION_MESSAGES.required
    if (!values.unitOfMeasure) errors.unitOfMeasure = VALIDATION_MESSAGES.required
    else {
        const minStockError = validateQuantity(values.minStock, values.unitOfMeasure, {
            allowZero: true,
        })
        if (minStockError) errors.minStock = minStockError
    }
    return errors
}

const saveItem = ({ name, categoryId, unitOfMeasure, minStock }, item) => {
    const payload = { name, categoryId: Number(categoryId), minStock: parseQuantity(minStock) }
    return item ? updateItem(item.id, payload) : createItem({ ...payload, unitOfMeasure })
}

export const useItemForm = ({ item, onSaved }) => {
    const toast = useToast()
    return useForm({
        initialValues: toInitialValues(item),
        validate,
        onSubmit: async (values) => {
            await saveItem(values, item)
            toast.success(CATALOG_MESSAGES.itemSaved)
            onSaved()
        },
    })
}
