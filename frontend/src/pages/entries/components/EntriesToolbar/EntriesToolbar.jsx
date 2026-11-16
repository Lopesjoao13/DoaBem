import { DateField } from '@/components/DateField/DateField.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { FilterBar, FilterSlot } from '@/components/FilterBar/FilterBar.jsx'
import { SearchField } from '@/components/SearchField/SearchField.jsx'
import { Select } from '@/components/Select/Select.jsx'
import { ALL_ITEMS } from '@/pages/entries/constants/entryOptions.js'
import { ALL_USERS } from '@/constants/filterOptions.js'

export const EntriesToolbar = ({
    filters,
    registeredByOptions,
    itemOptions,
    isFiltered,
    onChange,
    onClear,
}) => (
    <FilterBar isFiltered={isFiltered} onClear={onClear}>
        <FilterSlot isGrowing>
            <Field label="Buscar" htmlFor="entries-search">
                <SearchField
                    id="entries-search"
                    name="search"
                    value={filters.search}
                    onChange={onChange}
                    placeholder="Origem ou nº da entrada"
                />
            </Field>
        </FilterSlot>
        <FilterSlot>
            <Field label="De" htmlFor="entries-from">
                <DateField
                    id="entries-from"
                    name="from"
                    value={filters.from}
                    max={filters.to || undefined}
                    onChange={onChange}
                />
            </Field>
        </FilterSlot>
        <FilterSlot>
            <Field label="Até" htmlFor="entries-to">
                <DateField
                    id="entries-to"
                    name="to"
                    value={filters.to}
                    min={filters.from || undefined}
                    onChange={onChange}
                />
            </Field>
        </FilterSlot>
        <FilterSlot>
            <Field label="Item recebido" htmlFor="entries-item">
                <Select
                    id="entries-item"
                    name="itemId"
                    value={filters.itemId}
                    onChange={onChange}
                    options={itemOptions}
                    placeholder={ALL_ITEMS}
                />
            </Field>
        </FilterSlot>
        <FilterSlot>
            <Field label="Registrado por" htmlFor="entries-user">
                <Select
                    id="entries-user"
                    name="registeredBy"
                    value={filters.registeredBy}
                    onChange={onChange}
                    options={registeredByOptions}
                    placeholder={ALL_USERS}
                />
            </Field>
        </FilterSlot>
    </FilterBar>
)
