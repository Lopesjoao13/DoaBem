const SEPARATOR = ';'
const BOM = '\uFEFF'
const FORMULA_PREFIXES = ['=', '+', '-', '@']

const escapeCell = (value) => {
    const text = String(value ?? '')
    const safe = FORMULA_PREFIXES.includes(text.charAt(0)) ? `'${text}` : text
    return `"${safe.replaceAll('"', '""')}"`
}

export const toCsv = (rows, columns) =>
    [
        columns.map(({ header }) => escapeCell(header)).join(SEPARATOR),
        ...rows.map((row) => columns.map(({ value }) => escapeCell(value(row))).join(SEPARATOR)),
    ].join('\r\n')

export const downloadCsv = (filename, content) => {
    const url = URL.createObjectURL(
        new Blob([`${BOM}${content}`], { type: 'text/csv;charset=utf-8' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}
