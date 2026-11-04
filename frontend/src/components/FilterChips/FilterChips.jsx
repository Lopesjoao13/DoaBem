import { Chip, Group } from './FilterChips.styles.js'

export const FilterChips = ({ label, options, value, counts, onChange }) => (
    <Group role="group" aria-label={label}>
        {options.map((option) => (
            <Chip
                key={option.value}
                type="button"
                aria-pressed={option.value === value}
                $isActive={option.value === value}
                onClick={() => onChange(option.value)}
            >
                {option.label}
                {counts && ` (${counts[option.value] ?? 0})`}
            </Chip>
        ))}
    </Group>
)
