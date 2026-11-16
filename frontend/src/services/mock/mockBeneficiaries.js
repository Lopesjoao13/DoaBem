import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { REQUEST_STATUS } from '@/constants/requestStatus.js'
import { VALIDATION_MESSAGES } from '@/constants/validationMessages.js'
import { isBlank } from '@/utils/validation.js'
import { db, nextId } from './mockDb.js'
import { simulateRequest } from './mockApi.js'
import {
    badRequest,
    conflict,
    findOrThrow,
    normalizeText,
    nowIso,
    paginate,
} from './mockHelpers.js'

const OPEN_STATUSES = [REQUEST_STATUS.PENDING, REQUEST_STATUS.APPROVED, REQUEST_STATUS.PICKED]

const toBeneficiaryResponse = ({
    id,
    responsibleName,
    phone,
    neighborhood,
    householdSize,
    notes,
    status,
    createdAt,
}) => ({ id, responsibleName, phone, neighborhood, householdSize, notes, status, createdAt })

const matchesFilters = (beneficiary, { search, status }) =>
    (!status || beneficiary.status === status) &&
    (!search ||
        beneficiary.responsibleName.toLowerCase().includes(normalizeText(search).toLowerCase()))

export const mockListBeneficiaries = ({ page, size, ...filters } = {}) =>
    simulateRequest(() =>
        paginate(
            db.beneficiaries
                .filter((beneficiary) => matchesFilters(beneficiary, filters))
                .map(toBeneficiaryResponse)
                .sort((first, second) =>
                    first.responsibleName.localeCompare(second.responsibleName),
                ),
            page,
            size,
        ),
    )

export const mockGetBeneficiary = (id) =>
    simulateRequest(() => toBeneficiaryResponse(findOrThrow(db.beneficiaries, id)))

const nullIfBlank = (value) => normalizeText(value) || null

const toBeneficiaryData = (payload) => {
    const fieldErrors = {}
    if (isBlank(payload.responsibleName)) fieldErrors.responsibleName = VALIDATION_MESSAGES.required
    if (!Number.isInteger(payload.householdSize) || payload.householdSize <= 0) {
        fieldErrors.householdSize = VALIDATION_MESSAGES.integerPositive
    }
    if (Object.keys(fieldErrors).length > 0) {
        throw badRequest('Revise os campos destacados.', fieldErrors)
    }

    return {
        responsibleName: normalizeText(payload.responsibleName),
        phone: nullIfBlank(payload.phone),
        neighborhood: nullIfBlank(payload.neighborhood),
        householdSize: payload.householdSize,
        notes: nullIfBlank(payload.notes),
    }
}

export const mockCreateBeneficiary = (payload) =>
    simulateRequest(() => {
        const beneficiary = {
            id: nextId('beneficiaries'),
            status: RECORD_STATUS.ACTIVE,
            createdAt: nowIso(),
            ...toBeneficiaryData(payload),
        }
        db.beneficiaries.push(beneficiary)
        return toBeneficiaryResponse(beneficiary)
    })

export const mockUpdateBeneficiary = (id, payload) =>
    simulateRequest(() => {
        const beneficiary = findOrThrow(db.beneficiaries, id)
        return toBeneficiaryResponse(Object.assign(beneficiary, toBeneficiaryData(payload)))
    })

export const mockSetBeneficiaryStatus = (id, status) =>
    simulateRequest(() => {
        const beneficiary = findOrThrow(db.beneficiaries, id)
        const hasOpenRequests = db.requests.some(
            (request) =>
                request.beneficiaryId === beneficiary.id && OPEN_STATUSES.includes(request.status),
        )
        if (status === RECORD_STATUS.INACTIVE && hasOpenRequests) {
            throw conflict(
                'A família tem solicitação pendente, aprovada ou separada. Conclua ou cancele antes de inativar.',
            )
        }
        beneficiary.status = status
        return toBeneficiaryResponse(beneficiary)
    })
