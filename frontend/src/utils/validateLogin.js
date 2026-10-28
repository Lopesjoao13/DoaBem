import { LOGIN_MESSAGES } from '@/constants/loginMessages.js'

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export const validateLogin = (email, password) => {
    const errors = {}

    if (!email.trim()) {
        errors.email = LOGIN_MESSAGES.emailRequired
    } else if (!EMAIL_PATTERN.test(email)) {
        errors.email = LOGIN_MESSAGES.emailInvalid
    }

    if (!password) {
        errors.password = LOGIN_MESSAGES.passwordRequired
    }

    return errors
}
