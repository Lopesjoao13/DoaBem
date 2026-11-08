const normalizeText = (text) =>
    text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

export const matchesQuery = (label, query) =>
    normalizeText(label).includes(normalizeText(query.trim()))

export const toggleValue = (values, value) =>
    values.includes(value) ? values.filter((current) => current !== value) : [...values, value]

const findLabel = (options, value) => options.find((option) => option.value === value)?.label

export const getSelectedLabel = ({ options, value, multiple, placeholder, allLabel }) => {
    if (!multiple) return findLabel(options, value) ?? placeholder?.label ?? ''
    if (value.length === options.length) return allLabel
    if (value.length === 0) return 'Nenhum selecionado'
    if (value.length === 1) return findLabel(options, value[0])
    return `${value.length} selecionados`
}
