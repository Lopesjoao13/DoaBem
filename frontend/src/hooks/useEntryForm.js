import { useState } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'
import { ENTRY_MESSAGES } from '@/constants/entryMessages.js'
import { ROUTES } from '@/constants/routes.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { useForm } from '@/hooks/useForm.js'
import { useItemOptions } from '@/hooks/useItemOptions.js'
import { useToast } from '@/hooks/useToast.js'
import { createEntry } from '@/services/entryService.js'
import { getTodayIso } from '@/utils/dateRange.js'
import { createLineKey, removeLine, updateLine } from '@/utils/lines.js'
import { parseQuantity, validateQuantity } from '@/utils/quantity.js'

const createEmptyLine = () => ({ key: createLineKey(), itemId: '', quantity: '', expiryDate: '' })

const validateLines = (lines, itemsById) => {
    const seen = new Set()
    return lines.map((line) => {
        const errors = {}
        const item = itemsById.get(line.itemId)
        if (!item) errors.itemId = VALIDATION_MESSAGES.required
        else if (seen.has(line.itemId)) errors.itemId = VALIDATION_MESSAGES.duplicatedItem
        else {
            const quantityError = validateQuantity(line.quantity, item.unitOfMeasure)
            if (quantityError) errors.quantity = quantityError
        }
        seen.add(line.itemId)
        return errors
    })
}

const buildValidator = (itemsById) => (values) => {
    const errors = {}
    if (!values.entryDate) errors.entryDate = VALIDATION_MESSAGES.required
    else if (values.entryDate > getTodayIso()) errors.entryDate = VALIDATION_MESSAGES.futureDate
    if (values.lines.length === 0) errors.linesEmpty = VALIDATION_MESSAGES.linesRequired
    errors.lines = validateLines(values.lines, itemsById)
    return errors
}

const toEntryRequest = ({ entryDate, source, anonymous, notes, lines }) => ({
    entryDate,
    source: anonymous ? null : source.trim() || null,
    anonymous,
    notes: notes.trim() || null,
    items: lines.map((line) => ({
        itemId: Number(line.itemId),
        quantity: parseQuantity(line.quantity),
        expiryDate: line.expiryDate || null,
    })),
})

export const useEntryForm = () => {
    const navigate = useNavigate()
    const toast = useToast()
    const itemOptions = useItemOptions()
    const [isReviewing, setIsReviewing] = useState(false)

    const form = useForm({
        initialValues: {
            entryDate: getTodayIso(),
            source: '',
            anonymous: false,
            notes: '',
            lines: [createEmptyLine()],
        },
        validate: buildValidator(itemOptions.itemsById),
        onSubmit: async (values) => {
            const { id } = await createEntry(toEntryRequest(values))
            toast.success(ENTRY_MESSAGES.saved)
            navigate(generatePath(ROUTES.ENTRY_DETAIL, { id }), { replace: true })
        },
    })

    const addLine = () => {
        form.changeField('lines', (lines) => [...lines, createEmptyLine()])
    }

    const deleteLine = (key) => {
        form.changeField('lines', (lines) => removeLine(lines, key))
    }

    const changeLine = (key, field, value) => {
        form.changeField('lines', (lines) => updateLine(lines, key, field, value))
    }

    const startReview = () => {
        if (form.validateNow()) setIsReviewing(true)
    }

    const backToEdit = () => {
        setIsReviewing(false)
    }

    const confirm = async () => {
        const isSaved = await form.submit()
        if (!isSaved) setIsReviewing(false)
    }

    return {
        ...form,
        itemOptions,
        isReviewing,
        addLine,
        deleteLine,
        changeLine,
        startReview,
        backToEdit,
        confirm,
    }
}
