import { IconPlus, IconTrash } from '@tabler/icons-react'
import { Button } from '@/components/Button/Button.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { Input } from '@/components/Input/Input.jsx'
import { Select } from '@/components/Select/Select.jsx'
import { UNIT_LABELS } from '@/constants/units.js'
import { getDescribedBy } from '@/utils/a11y.js'
import { formatQuantity } from '@/utils/formatters.js'
import { getQuantityStep } from '@/utils/quantity.js'
import { LineGrid, Lines, RemoveSlot, StyledItemLinesEditor } from './ItemLinesEditor.styles.js'

const SELECT_ITEM = { value: '', label: 'Selecione o item' }

const LineRow = ({
    line,
    index,
    error = {},
    itemOptions,
    itemsById,
    quantityField,
    showAvailable,
    expiryHint,
    canRemove,
    onChange,
    onRemove,
}) => {
    const id = `line-${line.key}`
    const item = itemsById.get(line.itemId)
    const unitLabel = item ? ` (${UNIT_LABELS[item.unitOfMeasure]})` : ''
    const quantityHint =
        showAvailable && item
            ? `Disponível: ${formatQuantity(item.available, item.unitOfMeasure)}`
            : ''
    const quantityError = error[quantityField]

    return (
        <LineGrid $hasExpiry={Boolean(expiryHint)}>
            <Field label={`Item ${index + 1}`} htmlFor={`${id}-item`} error={error.itemId}>
                <Select
                    id={`${id}-item`}
                    value={line.itemId}
                    onChange={(event) => onChange(line.key, 'itemId', event.target.value)}
                    options={itemOptions}
                    placeholder={SELECT_ITEM}
                    error={error.itemId}
                />
            </Field>
            <Field
                label={`Quantidade${unitLabel}`}
                htmlFor={`${id}-qty`}
                hint={quantityHint}
                error={quantityError}
            >
                <Input
                    id={`${id}-qty`}
                    inputMode="decimal"
                    step={item ? getQuantityStep(item.unitOfMeasure) : undefined}
                    value={line[quantityField]}
                    onChange={(event) => onChange(line.key, quantityField, event.target.value)}
                    error={quantityError}
                    aria-describedby={getDescribedBy(`${id}-qty`, {
                        error: quantityError,
                        hint: quantityHint,
                    })}
                />
            </Field>
            {expiryHint && (
                <Field label="Validade (opcional)" htmlFor={`${id}-expiry`} hint={expiryHint}>
                    <Input
                        id={`${id}-expiry`}
                        type="date"
                        value={line.expiryDate}
                        onChange={(event) => onChange(line.key, 'expiryDate', event.target.value)}
                    />
                </Field>
            )}
            <RemoveSlot>
                <Button
                    variant="text"
                    family="deny"
                    onClick={() => onRemove(line.key)}
                    disabled={!canRemove}
                    aria-label={`Remover item ${index + 1}`}
                    title="Remover linha"
                >
                    <IconTrash size={18} stroke={2} />
                </Button>
            </RemoveSlot>
        </LineGrid>
    )
}

export const ItemLinesEditor = ({
    lines,
    errors = [],
    itemOptions,
    itemsById,
    quantityField = 'quantity',
    showAvailable = false,
    expiryHint,
    onChange,
    onAdd,
    onRemove,
}) => (
    <StyledItemLinesEditor>
        <Lines>
            {lines.map((line, index) => (
                <LineRow
                    key={line.key}
                    line={line}
                    index={index}
                    error={errors[index]}
                    itemOptions={itemOptions}
                    itemsById={itemsById}
                    quantityField={quantityField}
                    showAvailable={showAvailable}
                    expiryHint={expiryHint}
                    canRemove={lines.length > 1}
                    onChange={onChange}
                    onRemove={onRemove}
                />
            ))}
        </Lines>
        <div>
            <Button variant="outline" onClick={onAdd}>
                <IconPlus size={16} stroke={2} />
                Adicionar item
            </Button>
        </div>
    </StyledItemLinesEditor>
)
