import { PASSWORD_LENGTH } from '@/constants/password.js'

export const hasErrors = (errors) =>
    Object.values(errors).some((error) =>
        error && typeof error === 'object' ? hasErrors(error) : Boolean(error),
    )

export const isBlank = (value) => !String(value ?? '').trim()

export const isValidPassword = (value) => {
    const length = String(value ?? '').length
    return length >= PASSWORD_LENGTH.MIN && length <= PASSWORD_LENGTH.MAX
}

export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/
