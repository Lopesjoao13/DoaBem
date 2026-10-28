import { FilterChips } from '@/components/FilterChips/FilterChips.jsx'
import { SearchField } from '@/components/SearchField/SearchField.jsx'
import { Select } from '@/components/Select/Select.jsx'
import { Toolbar } from '@/components/Toolbar/Toolbar.jsx'
import {
    ALL_FILTER,
    LEVEL_FILTER_OPTIONS,
    STATUS_FILTER_OPTIONS,
} from '@/constants/stockFilters.js'

const ALL_CATEGORIES = { value: ALL_FILTER, label: 'Todas as categorias' }

export const StockToolbar = ({
    search,
    categoryId,
    categories,
    level,
    levelCounts,
    status,
    onSearchChange,
    onCategoryChange,
    onLevelChange,
    onStatusChange,
}) => (
    <Toolbar>
        <SearchField
            value={search}
            onChange={onSearchChange}
            placeholder="Buscar por item"
            aria-label="Buscar por item"
        />
        <Select
            value={categoryId}
            onChange={onCategoryChange}
            options={categories}
            placeholder={ALL_CATEGORIES}
            aria-label="Filtrar por categoria"
        />
        <FilterChips
            label="Filtrar por nível"
            options={LEVEL_FILTER_OPTIONS}
            value={level}
            counts={levelCounts}
            onChange={onLevelChange}
        />
        <FilterChips
            label="Filtrar por situação"
            options={STATUS_FILTER_OPTIONS}
            value={status}
            onChange={onStatusChange}
        />
    </Toolbar>
)
