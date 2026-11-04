let lastLineKey = 0

export const createLineKey = () => {
    lastLineKey += 1
    return `line-${lastLineKey}`
}

export const updateLine = (lines, key, field, value) =>
    lines.map((line) => (line.key === key ? { ...line, [field]: value } : line))

export const removeLine = (lines, key) => lines.filter((line) => line.key !== key)
