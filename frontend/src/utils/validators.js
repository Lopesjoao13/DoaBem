const ID_PATTERN = /^\d+$/
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const isId = (value) => ID_PATTERN.test(value)

export const isIsoDate = (value) => ISO_DATE_PATTERN.test(value)

export const isEmptyOr = (validate) => (value) => value === '' || validate(value)

export const isOneOf = (values) => (value) => values.includes(value)
