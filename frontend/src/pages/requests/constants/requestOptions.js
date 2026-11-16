import { REQUEST_STATUS, REQUEST_TABS } from '@/constants/requestStatus.js'

export const OPEN_STATUSES = [REQUEST_STATUS.PENDING, REQUEST_STATUS.APPROVED]

export const toStatusOptions = (counts) =>
    REQUEST_TABS.map(({ value, label }) => ({ value, label: `${label} (${counts[value] ?? 0})` }))
