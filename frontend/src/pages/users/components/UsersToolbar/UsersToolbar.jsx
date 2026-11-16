import { Field } from '@/components/Field/Field.jsx'
import { FilterBar, FilterSlot } from '@/components/FilterBar/FilterBar.jsx'
import { SearchField } from '@/components/SearchField/SearchField.jsx'
import { Select } from '@/components/Select/Select.jsx'
import {
    ROLE_OPTIONS,
    STATUS_OPTIONS,
    ALL_ROLES,
    ALL_STATUS,
} from '@/pages/users/constants/userOptions.js'

export const UsersToolbar = ({ filters, isFiltered, onChange, onClear }) => (
    <FilterBar isFiltered={isFiltered} onClear={onClear}>
        <FilterSlot isGrowing>
            <Field label="Buscar" htmlFor="users-search">
                <SearchField
                    id="users-search"
                    name="search"
                    value={filters.search}
                    onChange={onChange}
                    placeholder="Nome ou e-mail"
                />
            </Field>
        </FilterSlot>
        <FilterSlot>
            <Field label="Perfil" htmlFor="users-role">
                <Select
                    id="users-role"
                    name="role"
                    value={filters.role}
                    onChange={onChange}
                    options={ROLE_OPTIONS}
                    placeholder={ALL_ROLES}
                />
            </Field>
        </FilterSlot>
        <FilterSlot>
            <Field label="Situação" htmlFor="users-status">
                <Select
                    id="users-status"
                    name="status"
                    value={filters.status}
                    onChange={onChange}
                    options={STATUS_OPTIONS}
                    placeholder={ALL_STATUS}
                />
            </Field>
        </FilterSlot>
    </FilterBar>
)
