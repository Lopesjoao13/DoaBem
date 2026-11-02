import { IconAlertTriangle, IconCircleCheck, IconInfoCircle } from '@tabler/icons-react'

export const TONES = {
    NEUTRAL: 'neutral',
    SUCCESS: 'success',
    WARNING: 'warning',
    CRITICAL: 'critical',
    INFO: 'info',
}

export const TONE_ICONS = {
    [TONES.SUCCESS]: IconCircleCheck,
    [TONES.WARNING]: IconAlertTriangle,
    [TONES.CRITICAL]: IconAlertTriangle,
    [TONES.INFO]: IconInfoCircle,
    [TONES.NEUTRAL]: IconInfoCircle,
}
