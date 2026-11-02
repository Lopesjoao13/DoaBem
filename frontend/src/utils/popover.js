import {
    POPOVER_MAX_HEIGHT_PX,
    POPOVER_OFFSET_PX,
    POPOVER_VIEWPORT_MARGIN_PX,
} from '@/constants/popover.js'

export const computePopoverPosition = (trigger, popover, { matchWidth, limitHeight }) => {
    const rect = trigger.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom - POPOVER_VIEWPORT_MARGIN_PX
    const spaceAbove = rect.top - POPOVER_VIEWPORT_MARGIN_PX
    const height = limitHeight
        ? Math.min(popover.scrollHeight, POPOVER_MAX_HEIGHT_PX)
        : popover.offsetHeight
    const opensUp = height > spaceBelow && spaceAbove > spaceBelow
    const base = { left: rect.left, ...(matchWidth && { width: rect.width }) }
    const limit = (space) =>
        limitHeight ? { maxHeight: Math.min(POPOVER_MAX_HEIGHT_PX, space) } : {}

    return opensUp
        ? {
              ...base,
              bottom: window.innerHeight - rect.top + POPOVER_OFFSET_PX,
              ...limit(spaceAbove),
          }
        : { ...base, top: rect.bottom + POPOVER_OFFSET_PX, ...limit(spaceBelow) }
}
