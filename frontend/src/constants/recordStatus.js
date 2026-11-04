import { TONES } from './tones.js'

export const RECORD_STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
}

export const RECORD_STATUS_LABELS = {
    [RECORD_STATUS.ACTIVE]: 'Ativo',
    [RECORD_STATUS.INACTIVE]: 'Inativo',
}

export const RECORD_STATUS_TONES = {
    [RECORD_STATUS.ACTIVE]: TONES.SUCCESS,
    [RECORD_STATUS.INACTIVE]: TONES.NEUTRAL,
}
