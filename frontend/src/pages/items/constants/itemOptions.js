import { UNITS } from '@/constants/units.js'

export const UNIT_OPTIONS = [
    { value: UNITS.UNIT, label: 'Unidade (un) — só inteiros' },
    { value: UNITS.KG, label: 'Quilograma (kg) — até 3 casas' },
    { value: UNITS.L, label: 'Litro (L) — até 3 casas' },
]

export const SELECT_CATEGORY = { value: '', label: 'Selecione a categoria' }
export const SELECT_UNIT = { value: '', label: 'Selecione a unidade' }
