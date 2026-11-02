import { DateField } from '@/components/DateField/DateField.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { FilterBar, FilterSlot } from '@/components/FilterBar/FilterBar.jsx'
import { Select } from '@/components/Select/Select.jsx'
import {
    TYPE_OPTIONS,
    ALL_ITEMS,
    ALL_TYPES,
    ALL_USERS,
} from '@/pages/movements/constants/movementOptions.js'

export const MovementFilters = ({
    filters,
    itemOptions,
    userOptions,
    isFiltered,
    onChange,
    onClear,
}) => (
    <FilterBar isFiltered={isFiltered} onClear={onClear}>
        <FilterSlot>
            <Field label="De" htmlFor="movement-from">
                <DateField
                    id="movement-from"
                    name="from"
                    value={filters.from}
                    max={filters.to || undefined}
                    onChange={onChange}
                />
            </Field>
        </FilterSlot>
        <FilterSlot>
            <Field label="Até" htmlFor="movement-to">
                <DateField
                    id="movement-to"
                    name="to"
                    value={filters.to}
                    min={filters.from || undefined}
                    onChange={onChange}
                />
            </Field>
        </FilterSlot>
        <FilterSlot>
            <Field label="Item" htmlFor="movement-item">
                <Select
                    id="movement-item"
                    name="itemId"
                    value={filters.itemId}
                    onChange={onChange}
                    options={itemOptions}
                    placeholder={ALL_ITEMS}
                />
            </Field>
        </FilterSlot>
        <FilterSlot>
            <Field label="Tipo" htmlFor="movement-type">
                <Select
                    id="movement-type"
                    name="type"
                    value={filters.type}
                    onChange={onChange}
                    options={TYPE_OPTIONS}
                    placeholder={ALL_TYPES}
                />
            </Field>
        </FilterSlot>
        <FilterSlot>
            <Field label="Usuário" htmlFor="movement-user">
                <Select
                    id="movement-user"
                    name="userId"
                    value={filters.userId}
                    onChange={onChange}
                    options={userOptions}
                    placeholder={ALL_USERS}
                />
            </Field>
        </FilterSlot>
    </FilterBar>
)
