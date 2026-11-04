import { useCallback, useState } from 'react'
import { API_MESSAGES } from '@/constants/apiMessages.js'
import { hasErrors } from '@/utils/validation.js'

const resolveValue = (valueOrUpdater, current) =>
    typeof valueOrUpdater === 'function' ? valueOrUpdater(current) : valueOrUpdater

export const useForm = ({ initialValues, validate, onSubmit }) => {
    const [values, setValues] = useState(initialValues)
    const [errors, setErrors] = useState({})
    const [formError, setFormError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const changeField = useCallback((name, valueOrUpdater) => {
        setValues((current) => ({
            ...current,
            [name]: resolveValue(valueOrUpdater, current[name]),
        }))
        setErrors((current) => ({ ...current, [name]: undefined }))
    }, [])

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target
        changeField(name, type === 'checkbox' ? checked : value)
    }

    const reset = useCallback((nextValues) => {
        setValues(nextValues)
        setErrors({})
        setFormError('')
    }, [])

    const validateNow = () => {
        const nextErrors = validate ? validate(values) : {}
        setErrors(nextErrors)
        setFormError('')
        return !hasErrors(nextErrors)
    }

    const submit = async (event) => {
        event?.preventDefault()
        if (!validateNow()) return false

        setIsSubmitting(true)
        try {
            await onSubmit(values)
            return true
        } catch (error) {
            console.error('Falha ao enviar o formulário:', error.message)
            setFormError(error.message || API_MESSAGES.unexpected)
            if (error.fieldErrors) setErrors(error.fieldErrors)
            return false
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        values,
        errors,
        formError,
        isSubmitting,
        handleChange,
        changeField,
        reset,
        validateNow,
        submit,
    }
}
