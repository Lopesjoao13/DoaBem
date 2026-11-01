import { IconArrowDown, IconArrowUp } from '@tabler/icons-react'

export const SORT_DIRECTIONS = {
    ASC: 'asc',
    DESC: 'desc',
}

export const ARIA_SORT = {
    [SORT_DIRECTIONS.ASC]: 'ascending',
    [SORT_DIRECTIONS.DESC]: 'descending',
}

export const SORT_ICONS = {
    [SORT_DIRECTIONS.ASC]: IconArrowUp,
    [SORT_DIRECTIONS.DESC]: IconArrowDown,
}
