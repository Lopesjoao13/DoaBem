const normalize = (text) =>
    String(text ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

export const matchesText = (fields, term) => {
    const query = normalize(term.trim())
    return fields.some((field) => normalize(field).includes(query))
}
