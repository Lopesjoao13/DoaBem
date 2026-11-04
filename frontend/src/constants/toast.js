import { IconAlertTriangle, IconCircleCheck, IconInfoCircle } from '@tabler/icons-react'
import { TONES } from './tones.js'

export const TOAST_DURATION_MS = 4000

export const TOAST_TYPES = {
    SUCCESS: TONES.SUCCESS,
    ERROR: TONES.CRITICAL,
    INFO: TONES.INFO,
}

export const TOAST_ICONS = {
    [TOAST_TYPES.SUCCESS]: IconCircleCheck,
    [TOAST_TYPES.ERROR]: IconAlertTriangle,
    [TOAST_TYPES.INFO]: IconInfoCircle,
}
