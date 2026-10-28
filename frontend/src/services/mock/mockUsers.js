import { PERMISSIONS } from '@/constants/permissions.js'
import { ROLES } from '@/constants/roles.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { EMAIL_PATTERN, isBlank, isValidPassword } from '@/utils/validation.js'
import { db, nextId } from './mockDb.js'
import { simulateRequest } from './mockApi.js'
import {
    badRequest,
    businessRule,
    conflict,
    findOrThrow,
    normalizeText,
    nowIso,
    paginate,
} from './mockHelpers.js'

const MANAGE = { allowedRoles: PERMISSIONS.MANAGE_USERS }

const toUserResponse = ({ id, name, email, role, active, createdAt }) => ({
    id,
    name,
    email,
    role,
    active,
    createdAt,
})

export const mockListUsers = ({ page, size } = {}) =>
    simulateRequest(
        () =>
            paginate(
                db.users
                    .map(toUserResponse)
                    .sort((first, second) => first.name.localeCompare(second.name)),
                page,
                size,
            ),
        MANAGE,
    )

const validateUser = ({ name, email, role }) => {
    const fieldErrors = {}
    if (isBlank(name)) fieldErrors.name = VALIDATION_MESSAGES.required
    if (!EMAIL_PATTERN.test(normalizeText(email)))
        fieldErrors.email = VALIDATION_MESSAGES.emailInvalid
    if (!Object.values(ROLES).includes(role)) fieldErrors.role = VALIDATION_MESSAGES.required
    return fieldErrors
}

const validatePassword = (password) =>
    isValidPassword(password) ? {} : { password: VALIDATION_MESSAGES.passwordLength }

const throwIfInvalid = (fieldErrors) => {
    if (Object.keys(fieldErrors).length > 0) {
        throw badRequest('Revise os campos destacados.', fieldErrors)
    }
}

const ensureUniqueEmail = (email, id = null) => {
    if (db.users.some((user) => user.id !== id && user.email === email)) {
        throw conflict('Já existe um usuário com este e-mail.')
    }
}

export const mockCreateUser = (payload) =>
    simulateRequest(() => {
        throwIfInvalid({ ...validateUser(payload), ...validatePassword(payload.password) })
        const email = normalizeText(payload.email).toLowerCase()
        ensureUniqueEmail(email)

        const user = {
            id: nextId('users'),
            name: normalizeText(payload.name),
            email,
            password: payload.password,
            role: payload.role,
            active: true,
            createdAt: nowIso(),
        }
        db.users.push(user)
        return toUserResponse(user)
    }, MANAGE)

export const mockUpdateUser = (id, payload) =>
    simulateRequest((currentUser) => {
        const user = findOrThrow(db.users, id)
        throwIfInvalid(validateUser(payload))
        const email = normalizeText(payload.email).toLowerCase()
        ensureUniqueEmail(email, user.id)
        if (user.id === currentUser.id && payload.role !== user.role) {
            throw businessRule('Você não pode alterar o seu próprio perfil.')
        }

        Object.assign(user, { name: normalizeText(payload.name), email, role: payload.role })
        return toUserResponse(user)
    }, MANAGE)

export const mockSetUserActive = (id, active) =>
    simulateRequest((currentUser) => {
        const user = findOrThrow(db.users, id)
        if (!active && user.id === currentUser.id) {
            throw businessRule('Você não pode desativar o seu próprio usuário.')
        }
        user.active = active
        return toUserResponse(user)
    }, MANAGE)

export const mockListUserOptions = () =>
    simulateRequest(() =>
        db.users
            .map(({ id, name }) => ({ id, name }))
            .sort((first, second) => first.name.localeCompare(second.name)),
    )
