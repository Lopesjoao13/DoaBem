import { PERMISSIONS } from '@/constants/permissions.js'
import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { UNITS } from '@/constants/units.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { formatQuantity } from '@/utils/formatters.js'
import { isBlank } from '@/utils/validation.js'
import { db, nextId } from './mockDb.js'
import { simulateRequest } from './mockApi.js'
import {
    badRequest,
    businessRule,
    conflict,
    findOrThrow,
    normalizeText,
    paginate,
    sameText,
} from './mockHelpers.js'
import { getBalances } from './mockStock.js'

const MANAGE = { allowedRoles: PERMISSIONS.MANAGE_CATALOG }
const FIELD_ERROR_MESSAGE = 'Revise os campos destacados.'

const byName = (first, second) => first.name.localeCompare(second.name)

const toCategoryResponse = ({ id, name, description, active }) => ({
    id,
    name,
    description,
    active,
})

export const mockListCategories = ({ active, page, size } = {}) =>
    simulateRequest(() =>
        paginate(
            db.categories
                .filter((category) => active === undefined || category.active === active)
                .map(toCategoryResponse)
                .sort(byName),
            page,
            size,
        ),
    )

const validateCategory = ({ name }, id = null) => {
    if (isBlank(name)) throw badRequest(FIELD_ERROR_MESSAGE, { name: VALIDATION_MESSAGES.required })
    const duplicated = db.categories.some(
        (category) => category.id !== id && sameText(category.name, name),
    )
    if (duplicated) throw conflict('Já existe uma categoria com este nome.')
}

const toCategoryData = ({ name, description }) => ({
    name: normalizeText(name),
    description: normalizeText(description) || null,
})

export const mockCreateCategory = (payload) =>
    simulateRequest(() => {
        validateCategory(payload)
        const category = { id: nextId('categories'), active: true, ...toCategoryData(payload) }
        db.categories.push(category)
        return toCategoryResponse(category)
    }, MANAGE)

export const mockUpdateCategory = (id, payload) =>
    simulateRequest(() => {
        const category = findOrThrow(db.categories, id)
        validateCategory(payload, category.id)
        return toCategoryResponse(Object.assign(category, toCategoryData(payload)))
    }, MANAGE)

export const mockSetCategoryActive = (id, active) =>
    simulateRequest(() => {
        const category = findOrThrow(db.categories, id)
        const hasActiveItems = db.items.some(
            (item) => item.categoryId === category.id && item.status === RECORD_STATUS.ACTIVE,
        )
        if (!active && hasActiveItems) {
            throw conflict('Inative os itens ativos desta categoria antes de inativá-la.')
        }
        category.active = active
        return toCategoryResponse(category)
    }, MANAGE)

const toItemResponse = (item) => ({
    id: item.id,
    categoryId: item.categoryId,
    categoryName: db.categories.find((category) => category.id === item.categoryId)?.name ?? '',
    name: item.name,
    unitOfMeasure: item.unitOfMeasure,
    minStock: item.minStock,
    status: item.status,
})

const matchesItemFilters = (item, { status, categoryId, search }) =>
    (!status || item.status === status) &&
    (!categoryId || item.categoryId === Number(categoryId)) &&
    (!search || item.name.toLowerCase().includes(normalizeText(search).toLowerCase()))

export const mockListItems = ({ page, size, ...filters } = {}) =>
    simulateRequest(() =>
        paginate(
            db.items
                .filter((item) => matchesItemFilters(item, filters))
                .map(toItemResponse)
                .sort(byName),
            page,
            size,
        ),
    )

const validateItem = ({ name, categoryId, unitOfMeasure, minStock }, id = null) => {
    const fieldErrors = {}
    const category = db.categories.find((entry) => entry.id === Number(categoryId))
    const minStockValue = Number(minStock ?? 0)

    if (isBlank(name)) fieldErrors.name = VALIDATION_MESSAGES.required
    if (!category) fieldErrors.categoryId = VALIDATION_MESSAGES.required
    if (!Object.values(UNITS).includes(unitOfMeasure)) {
        fieldErrors.unitOfMeasure = VALIDATION_MESSAGES.required
    }
    if (Number.isNaN(minStockValue) || minStockValue < 0) {
        fieldErrors.minStock = 'Informe um estoque mínimo igual ou maior que zero.'
    }
    if (Object.keys(fieldErrors).length > 0) throw badRequest(FIELD_ERROR_MESSAGE, fieldErrors)

    if (!category.active) throw businessRule('A categoria está inativa e não pode receber itens.')
    const duplicated = db.items.some(
        (item) => item.id !== id && item.categoryId === category.id && sameText(item.name, name),
    )
    if (duplicated) throw conflict('Já existe um item com este nome nesta categoria.')
    return minStockValue
}

export const mockCreateItem = (payload) =>
    simulateRequest(() => {
        const minStock = validateItem(payload)
        const item = {
            id: nextId('items'),
            status: RECORD_STATUS.ACTIVE,
            name: normalizeText(payload.name),
            categoryId: Number(payload.categoryId),
            unitOfMeasure: payload.unitOfMeasure,
            minStock,
        }
        db.items.push(item)
        return toItemResponse(item)
    }, MANAGE)

export const mockUpdateItem = (id, payload) =>
    simulateRequest(() => {
        const item = findOrThrow(db.items, id)
        const minStock = validateItem({ ...payload, unitOfMeasure: item.unitOfMeasure }, item.id)
        Object.assign(item, {
            name: normalizeText(payload.name),
            categoryId: Number(payload.categoryId),
            minStock,
        })
        return toItemResponse(item)
    }, MANAGE)

const ensureCanInactivate = (item) => {
    const balance = getBalances().get(item.id)
    if (!balance) return
    if (balance.reserved > 0) {
        throw conflict(
            `${item.name} tem ${formatQuantity(balance.reserved, item.unitOfMeasure)} reservados em solicitações separadas. Conclua a entrega ou cancele a separação antes de inativar.`,
        )
    }
    if (balance.available > 0) {
        throw conflict(
            `${item.name} ainda tem ${formatQuantity(balance.available, item.unitOfMeasure)} disponíveis. Zere o saldo por entrega ou saída por ajuste antes de inativar.`,
        )
    }
}

export const mockSetItemStatus = (id, status) =>
    simulateRequest(() => {
        const item = findOrThrow(db.items, id)
        if (status === RECORD_STATUS.INACTIVE) ensureCanInactivate(item)
        if (status === RECORD_STATUS.ACTIVE) {
            const category = findOrThrow(db.categories, item.categoryId)
            if (!category.active) throw conflict('Reative a categoria antes de reativar o item.')
        }
        item.status = status
        return toItemResponse(item)
    }, MANAGE)
