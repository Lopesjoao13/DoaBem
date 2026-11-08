export const getDelta = (current, previous) => {
    if (current === previous) return { direction: 'flat', percent: 0 }
    if (previous === 0) return { direction: 'up', percent: null }
    const percent = Math.round(((current - previous) / previous) * 100)
    return { direction: percent > 0 ? 'up' : 'down', percent: Math.abs(percent) }
}
