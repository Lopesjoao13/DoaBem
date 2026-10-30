import { Button } from '@/components/Button/Button.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { Input } from '@/components/Input/Input.jsx'
import { Select } from '@/components/Select/Select.jsx'
import { LISTED_MOVEMENT_TYPES, MOVEMENT_TYPE_LABELS } from '@/constants/movementTypes.js'
import { ClearSlot, Grid } from './MovementFilters.styles.js'

const TYPE_OPTIONS = LISTED_MOVEMENT_TYPES.map((type) => ({
    value: type,
    label: MOVEMENT_TYPE_LABELS[type],
}))
const ALL_ITEMS = { value: '', label: 'Todos os itens' }
const ALL_TYPES = { value: '', label: 'Todos os tipos' }
const ALL_USERS = { value: '', label: 'Todos os usuários' }

export const MovementFilters = ({ filters, itemOptions, userOptions, onChange, onClear }) => (
    <Grid>
        <Field label="De" htmlFor="movement-from">
            <Input
                id="movement-from"
                type="date"
                name="from"
                value={filters.from}
                max={filters.to || undefined}
                onChange={onChange}
            />
        </Field>
        <Field label="Até" htmlFor="movement-to">
            <Input
                id="movement-to"
                type="date"
                name="to"
                value={filters.to}
                min={filters.from || undefined}
                onChange={onChange}
            />
        </Field>
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
        <ClearSlot>
            <Button variant="text" onClick={onClear}>
                Limpar filtros
            </Button>
        </ClearSlot>
    </Grid>
)
