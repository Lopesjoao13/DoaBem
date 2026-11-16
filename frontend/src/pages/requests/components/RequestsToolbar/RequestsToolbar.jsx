import { DateField } from '@/components/DateField/DateField.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { FilterBar, FilterSlot } from '@/components/FilterBar/FilterBar.jsx'
import { SearchField } from '@/components/SearchField/SearchField.jsx'
import { Select } from '@/components/Select/Select.jsx'
import { toStatusOptions } from '@/pages/requests/constants/requestOptions.js'
import { ALL_USERS } from '@/constants/filterOptions.js'

export const RequestsToolbar = ({
    tab,
    counts,
    filters,
    requestedByOptions,
    isFiltered,
    onTabChange,
    onChange,
    onClear,
}) => (
    <FilterBar isFiltered={isFiltered} onClear={onClear}>
        <FilterSlot isGrowing>
            <Field label="Buscar" htmlFor="requests-search">
                <SearchField
                    id="requests-search"
                    name="search"
                    value={filters.search}
                    onChange={onChange}
                    placeholder="Família ou nº da solicitação"
                />
            </Field>
        </FilterSlot>
        <FilterSlot>
            <Field label="Estado" htmlFor="requests-status">
                <Select
                    id="requests-status"
                    value={tab}
                    onChange={(event) => onTabChange(event.target.value)}
                    options={toStatusOptions(counts)}
                />
            </Field>
        </FilterSlot>
        <FilterSlot>
            <Field label="De" htmlFor="requests-from">
                <DateField
                    id="requests-from"
                    name="from"
                    value={filters.from}
                    max={filters.to || undefined}
                    onChange={onChange}
                />
            </Field>
        </FilterSlot>
        <FilterSlot>
            <Field label="Até" htmlFor="requests-to">
                <DateField
                    id="requests-to"
                    name="to"
                    value={filters.to}
                    min={filters.from || undefined}
                    onChange={onChange}
                />
            </Field>
        </FilterSlot>
        <FilterSlot>
            <Field label="Criada por" htmlFor="requests-user">
                <Select
                    id="requests-user"
                    name="requestedBy"
                    value={filters.requestedBy}
                    onChange={onChange}
                    options={requestedByOptions}
                    placeholder={ALL_USERS}
                />
            </Field>
        </FilterSlot>
    </FilterBar>
)
