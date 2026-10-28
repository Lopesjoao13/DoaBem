import { useRef } from 'react'
import { REQUEST_DECISIONS } from '@/constants/requestActions.js'
import { REQUEST_MESSAGES } from '@/constants/requestMessages.js'
import { REQUEST_STATUS } from '@/constants/requestStatus.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { useForm } from '@/hooks/useForm.js'
import { useToast } from '@/hooks/useToast.js'
import { decideRequest } from '@/services/requestService.js'
import { parseQuantity, validateQuantity } from '@/utils/quantity.js'
import { isBlank } from '@/utils/validation.js'

const validateApproval = (request, values) => {
    const errors = {}
    const approvedErrors = {}
    let hasCut = false

    request.items.forEach((requestItem) => {
        const value = values.approved[requestItem.id]
        const error = validateQuantity(value, requestItem.unitOfMeasure, { allowZero: true })
        if (error) approvedErrors[requestItem.id] = error
        else if (parseQuantity(value) > requestItem.requestedQty) {
            approvedErrors[requestItem.id] = REQUEST_MESSAGES.approvedAboveRequested
        } else if (parseQuantity(value) < requestItem.requestedQty) hasCut = true
    })

    if (Object.keys(approvedErrors).length > 0) errors.approved = approvedErrors
    if (hasCut && isBlank(values.justification))
        errors.justification = REQUEST_MESSAGES.cutJustification
    return errors
}

const validateRejection = (values) =>
    isBlank(values.justification)
        ? { justification: VALIDATION_MESSAGES.justificationRequired }
        : {}

export const useDecisionForm = ({ request, onDone }) => {
    const toast = useToast()
    const decisionRef = useRef(REQUEST_DECISIONS.APPROVE)

    const form = useForm({
        initialValues: {
            approved: Object.fromEntries(
                request.items.map((requestItem) => [
                    requestItem.id,
                    String(requestItem.requestedQty),
                ]),
            ),
            justification: '',
        },
        validate: (values) =>
            decisionRef.current === REQUEST_DECISIONS.REJECT
                ? validateRejection(values)
                : validateApproval(request, values),
        onSubmit: async (values) => {
            const result = await decideRequest(request.id, {
                decision: decisionRef.current,
                justification: values.justification,
                items: Object.entries(values.approved).map(([id, approvedQty]) => ({
                    id: Number(id),
                    approvedQty,
                })),
            })
            toast.success(
                result.status === REQUEST_STATUS.APPROVED
                    ? REQUEST_MESSAGES.approved
                    : REQUEST_MESSAGES.rejected,
            )
            onDone()
        },
    })

    const changeApproved = (requestItemId, value) => {
        form.changeField('approved', (current) => ({ ...current, [requestItemId]: value }))
    }

    const approve = () => {
        decisionRef.current = REQUEST_DECISIONS.APPROVE
        return form.submit()
    }

    const reject = () => {
        decisionRef.current = REQUEST_DECISIONS.REJECT
        return form.submit()
    }

    return { ...form, changeApproved, approve, reject }
}
