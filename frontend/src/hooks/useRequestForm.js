import { useMemo } from 'react'
import { INVALIDATES } from '@/constants/queryKeys.js'
import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { REQUEST_MESSAGES } from '@/constants/requestMessages.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { QUERY_KEYS } from '@/constants/queryKeys.js'
import { useFetch } from '@/hooks/useFetch.js'
import { useForm } from '@/hooks/useForm.js'
import { useItemOptions } from '@/hooks/useItemOptions.js'
import { useToast } from '@/hooks/useToast.js'
import { listBeneficiaries } from '@/services/beneficiaryService.js'
import { createRequest, getDeliverySummary } from '@/services/requestService.js'
import { createLineKey, removeLine, updateLine } from '@/utils/lines.js'
import { parseQuantity, validateQuantity } from '@/utils/quantity.js'
import { EMPTY_ROWS } from '@/constants/emptyValues.js'

const createEmptyLine = () => ({ key: createLineKey(), itemId: '', requestedQty: '' })

const buildValidator = (itemsById) => (values) => {
    const errors = {}
    if (!values.beneficiaryId) errors.beneficiaryId = VALIDATION_MESSAGES.required
    if (values.lines.length === 0) errors.linesEmpty = VALIDATION_MESSAGES.linesRequired

    const seen = new Set()
    errors.lines = values.lines.map((line) => {
        const lineErrors = {}
        const item = itemsById.get(line.itemId)
        if (!item) lineErrors.itemId = VALIDATION_MESSAGES.required
        else if (seen.has(line.itemId)) lineErrors.itemId = VALIDATION_MESSAGES.duplicatedItem
        else {
            const quantityError = validateQuantity(line.requestedQty, item.unitOfMeasure)
            if (quantityError) lineErrors.requestedQty = quantityError
        }
        seen.add(line.itemId)
        return lineErrors
    })
    return errors
}

const toRequestPayload = ({ beneficiaryId, lines }) => ({
    beneficiaryId: Number(beneficiaryId),
    lines: lines.map((line) => ({
        itemId: Number(line.itemId),
        requestedQty: parseQuantity(line.requestedQty),
    })),
})

const useDeliverySummary = (beneficiaryId) => {
    return useFetch([QUERY_KEYS.DELIVERY_SUMMARY, beneficiaryId], () =>
        beneficiaryId ? getDeliverySummary(beneficiaryId) : null,
    )
}

export const useRequestForm = ({ familyId = '', onSaved }) => {
    const toast = useToast()
    const itemOptions = useItemOptions({ withStock: true })

    const families = useFetch([QUERY_KEYS.BENEFICIARIES, { status: RECORD_STATUS.ACTIVE }], () =>
        listBeneficiaries({ status: RECORD_STATUS.ACTIVE }),
    )
    const familyOptions = useMemo(
        () =>
            (families.data?.content ?? EMPTY_ROWS).map((family) => ({
                value: String(family.id),
                label: `#${family.id} - ${family.responsibleName}`,
            })),
        [families.data],
    )

    const form = useForm({
        invalidates: INVALIDATES.REQUEST_CHANGE,
        initialValues: {
            beneficiaryId: familyId,
            lines: [createEmptyLine()],
        },
        validate: buildValidator(itemOptions.itemsById),
        onSubmit: async (values) => {
            const { id } = await createRequest(toRequestPayload(values))
            toast.success(REQUEST_MESSAGES.created)
            onSaved(id)
        },
    })

    const deliverySummary = useDeliverySummary(form.values.beneficiaryId)

    const isDirty =
        form.values.beneficiaryId !== familyId ||
        form.values.lines.some((line) => line.itemId !== '' || line.requestedQty !== '')

    return {
        ...form,
        isDirty,
        itemOptions,
        familyOptions,
        isLoadingFamilies: families.isLoading,
        deliverySummary: deliverySummary.data,
        addLine: () => form.changeField('lines', (lines) => [...lines, createEmptyLine()]),
        deleteLine: (key) => form.changeField('lines', (lines) => removeLine(lines, key)),
        changeLine: (key, field, value) =>
            form.changeField('lines', (lines) => updateLine(lines, key, field, value)),
    }
}
