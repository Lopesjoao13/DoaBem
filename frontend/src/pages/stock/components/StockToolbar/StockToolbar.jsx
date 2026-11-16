import { FilterBar, FilterSlot } from '@/components/FilterBar/FilterBar.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { SearchField } from '@/components/SearchField/SearchField.jsx'
import { Select } from '@/components/Select/Select.jsx'
import { StatusFilter } from '@/components/StatusFilter/StatusFilter.jsx'
import { toLevelOptions } from '@/pages/stock/constants/stockOptions.js'
import { ALL_CATEGORIES } from '@/constants/filterOptions.js'

export const StockToolbar = ({
    search,
    categoryId,
    categories,
    levels,
    levelCounts,
    status,
    isFiltered,
    onSearchChange,
    onCategoryChange,
    onLevelsChange,
    onStatusChange,
    onClear,
}) => (
    <FilterBar isFiltered={isFiltered} onClear={onClear}>
        <FilterSlot isGrowing>
            <Field label="Buscar" htmlFor="stock-search">
                <SearchField
                    id="stock-search"
                    value={search}
                    onChange={onSearchChange}
                    placeholder="Nome do item"
                />
            </Field>
        </FilterSlot>
        <FilterSlot>
            <Field label="Situação" htmlFor="stock-status">
                <StatusFilter id="stock-status" value={status} onChange={onStatusChange} />
            </Field>
        </FilterSlot>
        <FilterSlot>
            <Field label="Categoria" htmlFor="stock-category">
                <Select
                    id="stock-category"
                    value={categoryId}
                    onChange={onCategoryChange}
                    options={categories}
                    placeholder={ALL_CATEGORIES}
                />
            </Field>
        </FilterSlot>
        <FilterSlot>
            <Field label="Nível" htmlFor="stock-level">
                <Select
                    id="stock-level"
                    name="levels"
                    multiple
                    allLabel="Todos os níveis"
                    value={levels}
                    onChange={(event) => onLevelsChange(event.target.value)}
                    options={toLevelOptions(levelCounts)}
                />
            </Field>
        </FilterSlot>
    </FilterBar>
)
