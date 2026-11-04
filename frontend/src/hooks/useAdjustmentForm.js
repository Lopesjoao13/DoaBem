import { useCallback, useMemo } from 'react'
import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { STOCK_MESSAGES } from '@/constants/stockMessages.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { useFetch } from '@/hooks/useFetch.js'
import { useForm } from '@/hooks/useForm.js'
import { useToast } from '@/hooks/useToast.js'
import { createAdjustment, getStock } from '@/services/stockService.js'
import { parseQuantity, validateQuantity } from '@/utils/quantity.js'
import { isBlank } from '@/utils/validation.js'

const EMPTY_ROWS = []

const validate = (values, item) => {
    const errors = {}
    if (!item) errors.itemId = VALIDATION_MESSAGES.required
    if (!values.adjustmentReason) errors.adjustmentReason = VALIDATION_MESSAGES.reasonRequired
    if (isBlank(values.notes)) errors.notes = VALIDATION_MESSAGES.required
    if (item) {
        const quantityError = validateQuantity(values.quantity, item.unitOfMeasure)
        if (quantityError) errors.quantity = quantityError
        else if (parseQuantity(values.quantity) > item.available) {
            errors.quantity = STOCK_MESSAGES.adjustmentAboveAvailable
        }
    }
    return errors
}

export const useAdjustmentForm = ({ initialItemId, onSaved }) => {
    const toast = useToast()
    const loadItems = useCallback(() => getStock({ status: RECORD_STATUS.ACTIVE }), [])
    const { data, isLoading } = useFetch(loadItems)
    const items = data ?? EMPTY_ROWS

    const form = useForm({
        initialValues: {
            itemId: initialItemId ? String(initialItemId) : '',
            quantity: '',
            adjustmentReason: '',
            notes: '',
        },
        validate: (values) =>
            validate(
                values,
                items.find((row) => String(row.itemId) === values.itemId),
            ),
        onSubmit: async (values) => {
            await createAdjustment(values)
            toast.success(STOCK_MESSAGES.adjustmentSaved)
            onSaved()
        },
    })

    const selectedItem = items.find((row) => String(row.itemId) === form.values.itemId) ?? null
    const itemOptions = useMemo(
        () => items.map((row) => ({ value: String(row.itemId), label: row.name })),
        [items],
    )

    return { ...form, selectedItem, itemOptions, isLoadingItems: isLoading }
}
