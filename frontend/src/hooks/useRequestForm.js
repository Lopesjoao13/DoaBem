import { useCallback, useMemo } from 'react'
import { generatePath, useNavigate, useSearchParams } from 'react-router-dom'
import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { REQUEST_MESSAGES } from '@/constants/requestMessages.js'
import { ROUTES } from '@/constants/routes.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { useFetch } from '@/hooks/useFetch.js'
import { useForm } from '@/hooks/useForm.js'
import { useItemOptions } from '@/hooks/useItemOptions.js'
import { useToast } from '@/hooks/useToast.js'
import { listBeneficiaries } from '@/services/beneficiaryService.js'
import { createRequest, getDeliverySummary } from '@/services/requestService.js'
import { createLineKey, removeLine, updateLine } from '@/utils/lines.js'
import { validateQuantity } from '@/utils/quantity.js'

const EMPTY_ROWS = []

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

const useDeliverySummary = (beneficiaryId) => {
    const loadSummary = useCallback(
        () => (beneficiaryId ? getDeliverySummary(beneficiaryId) : Promise.resolve(null)),
        [beneficiaryId],
    )
    return useFetch(loadSummary)
}

export const useRequestForm = () => {
    const navigate = useNavigate()
    const toast = useToast()
    const [searchParams] = useSearchParams()
    const itemOptions = useItemOptions({ withStock: true })

    const loadFamilies = useCallback(() => listBeneficiaries({ status: RECORD_STATUS.ACTIVE }), [])
    const families = useFetch(loadFamilies)
    const familyOptions = useMemo(
        () =>
            (families.data?.content ?? EMPTY_ROWS).map((family) => ({
                value: String(family.id),
                label: `#${family.id} — ${family.responsibleName}`,
            })),
        [families.data],
    )

    const form = useForm({
        initialValues: {
            beneficiaryId: searchParams.get('familyId') ?? '',
            lines: [createEmptyLine()],
        },
        validate: buildValidator(itemOptions.itemsById),
        onSubmit: async (values) => {
            const { id } = await createRequest(values)
            toast.success(REQUEST_MESSAGES.created)
            navigate(generatePath(ROUTES.REQUEST_DETAIL, { id }), { replace: true })
        },
    })

    const deliverySummary = useDeliverySummary(form.values.beneficiaryId)

    return {
        ...form,
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
