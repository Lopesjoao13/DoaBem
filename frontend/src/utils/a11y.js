export const getDescribedBy = (id, { error, hint }) => {
    if (error) return `${id}-error`
    if (hint) return `${id}-hint`
    return undefined
}
