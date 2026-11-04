export const getNiceTicks = (maxValue, tickCount) => {
    const step = Math.max(1, Math.ceil(maxValue / tickCount))
    const top = Math.max(step, Math.ceil(maxValue / step) * step)
    return Array.from({ length: top / step + 1 }, (_, index) => index * step)
}

export const toPercent = (value, max) => (max > 0 ? (value / max) * 100 : 0)
